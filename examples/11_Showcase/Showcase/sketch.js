/**
 * Drag on the timeline to scrub, SPACE to pause, B to toggle bloom, W to toggle the warp.
 */
const D = 12;
const N = 120;

const BLOOM_FRAG = `
#ifdef GL_ES
precision mediump float;
#endif
uniform sampler2D tex0;
uniform vec2 texelSize;
uniform float threshold;
uniform float strength;
uniform float radius;
#define NUM 192
varying vec2 vTexCoord;

vec3 disc(vec2 uv, float r) {
    vec3 sum = vec3(0.0);
    float total = 0.0;
    for (int i = 0; i < NUM; i++) {
        float d = sqrt((float(i) + 0.5) / float(NUM));
        float a = float(i) * 2.39996;
        vec3 c = texture2D(tex0, uv + vec2(cos(a), sin(a)) * d * r * texelSize).rgb;
        float w = exp(-3.0 * d * d);
        sum += max(c - vec3(threshold), vec3(0.0)) / max(1.0 - threshold, 0.0001) * w;
        total += w;
    }
    return sum / total;
}

void main() {
    vec2 uv = vTexCoord;
    vec3 base = texture2D(tex0, uv).rgb;
    vec3 glow = disc(uv, radius) * 0.6 + disc(uv, radius * 4.0) * 0.4;
    gl_FragColor = vec4(base + glow * strength, 1.0);
}
`;

// Warps the space like a shockwave: every impact pushes the picture outwards along a ring that
// travels with the Shockwave's own ring. Each wave is (center x, center y, radius, strength), in pixels.
const MAX_WARPS = 4;
const WARP_FRAG = `
#ifdef GL_ES
precision mediump float;
#endif
uniform sampler2D tex0;
uniform vec2 canvasSize;
uniform vec4 waves[${MAX_WARPS}];
varying vec2 vTexCoord;

void main() {
    vec2 px = vTexCoord * canvasSize;
    vec2 offset = vec2(0.0);
    for (int i = 0; i < ${MAX_WARPS}; i++) {
        vec4 w = waves[i];
        if (w.w > 0.0) {
            vec2 v = px - w.xy;
            float d = length(v);
            // A band around the front: pulls the picture in front of it, pushes it behind.
            float x = (d - w.z) / (40.0 + w.z * 0.18);
            offset += v / max(d, 0.001) * w.w * x * exp(1.0 - x * x);
        }
    }
    gl_FragColor = texture2D(tex0, (px - offset) / canvasSize);
}
`;

const names = ['keyed', 'morph', 'spring', 'orbit'];

let palette;
let bg;
let overlay;
let bloom;
let bloomOn = true;
let warp;
let warpOn = true;

let tm;
let scene;

let core;
let rippleAmp;
let spin;
let cam;
let accent;
let word;
let comet;
let zoomKeyed;
let moons = [];
let waves = [];
let dust = [];

// Bound below: Keyed writes it before every draw().
var zoom = 1;

const barX0 = 40;
const barX1 = 600;
const barY = 604;
let scrubbing = false;

function setup() {
    createCanvas(640, 640, WEBGL);
    pixelDensity(1);
    overlay = createGraphics(640, 640);
    overlay.pixelDensity(1);
    overlay.textFont('monospace');
    overlay.noSmooth();

    tm = Keyed.init().setDuration(D);
    // The bloom takes hundreds of texture samples per pixel, too much for most phone GPUs.
    if (isMobile()) {
        bloomOn = false;
        warpOn = false;
    } else {
        bloom = createFilterShader(BLOOM_FRAG);
        warp = createFilterShader(WARP_FRAG);
    }

    bg = color(10, 10, 16);
    palette = [
        color(255, 70, 80),
        color(255, 190, 50),
        color(70, 140, 255),
        color(60, 230, 160),
    ];

    scene = [Pin.at(0), Pin.at(3), Pin.at(6), Pin.at(9)];

    // The hero: a closed outline that snaps to a new shape on every scene
    // and wobbles into it like jelly.
    const shapes = [makeCircleShape(150), makeKnotShape(52), makeStarShape(5, 190, 75), makeFlowerShape()];
    core = Keyed.of(shapes[0]);
    for (let i = 0; i < 4; i++) {
        core.key(Key.at(scene[i]).hold(), shapes[i]);
    }
    core.key(D, shapes[0]);

    // A custom effect runs a wave through the outline's depth.
    // Looking straight on you can't see it; the camera reveals it.
    const ripple = (source, t) => rippled(source(t), t);
    core.addEffect(new Spring((a, b, d) => a.lerp(b, d), 1.4, 0.3))
        .addEffect(ripple);

    rippleAmp = Keyed.ofFloat()
        .key(Key.at(scene[0]).setEasing(0.6), 40)
        .key(Key.at(scene[1]).setEasing(0.6), 10)
        .key(Key.at(scene[2]).setEasing(0.6), 55)
        .key(Key.at(scene[3]).setEasing(0.6), 25)
        .key(Key.at(D).setEasing(0.6), 40);

    // The camera: a quaternion per scene, sprung like a heavy rig, so
    // every cut whips around and settles.
    const views = [
        Quaternion.identity(),
        euler(1.05, 0, 0.35),
        euler(0.5, 0.7, 0),
        euler(1.3, 0, -0.5),
    ];
    cam = Keyed.of(views[0]);
    for (let i = 0; i < 4; i++) {
        cam.key(Key.at(scene[i]).hold(), views[i]);
    }
    cam.key(D, views[0])
        .addEffect(new Spring((a, b, d) => a.lerp(b, d), 0.9, 0.55));

    // A slow turntable underneath the camera.
    spin = Keyed.ofFloat()
        .key(0, 0)
        .key(D, -TWO_PI);

    // Field binding: zoom is a plain float, kept up to date by Keyed.
    const zooms = [1, 1.15, 0.92, 1.08];
    zoomKeyed = Keyed.bind(window, 'zoom');
    for (let i = 0; i < 4; i++) {
        zoomKeyed.key(Key.at(scene[i]).hold(), zooms[i]);
    }
    zoomKeyed.key(D, zooms[0])
        .addEffect(new Spring(new FloatLerp(), 2.2, 0.25));
    zoomKeyed.apply();

    // Lag crossfades the hard color cuts...
    accent = Keyed.ofColor();
    for (let i = 0; i < 4; i++) {
        accent.key(Key.at(scene[i]).hold(), palette[i]);
    }
    accent.key(D, palette[0])
        .addEffect(new Lag(new ColorLerp(), 0.6, 16));

    // ...and, being generic, morphs the words letter by letter.
    word = Keyed.ofString();
    for (let i = 0; i < 4; i++) {
        word.key(Key.at(scene[i]).hold(), names[i]);
    }
    word.key(D, names[0])
        .addEffect(new Lag(new StringLerp(), 0.5, 10));

    // Six moons: each holds a formation per scene, springs into the next
    // one with its own stiffness, and circles on top of that.
    moons = [];
    for (let i = 0; i < 6; i++) {
        const a = (i * TWO_PI) / 6 - HALF_PI;
        const side = i % 2 === 0 ? 1 : -1;
        const formation = [
            createVector(cos(a) * 215, sin(a) * 215, 0),
            createVector(cos(a) * 110, sin(a) * 110, side * 150),
            createVector(0, 0, 50 + i * 42),
            createVector(cos(a + PI / 6) * 240, sin(a + PI / 6) * 240, side * 70),
        ];
        const moon = Keyed.ofVector();
        for (let s = 0; s < 4; s++) {
            moon.key(Key.at(scene[s]).hold(), formation[s]);
        }
        moon.key(D, formation[0])
            .addEffect(Effect.spring(1.3 + i * 0.2, 0.35))
            // Whole number of turns per loop, so the loop stays seamless.
            .addEffect(new Orbit(16 + i * 3, 0.5 + 0.25 * (i % 4), createVector(cos(a), sin(a), 1.5)));
        moons.push(moon);
    }

    // A comet on a closed 3D spline, two laps per loop, with a bit of wiggle.
    const n = 7;
    const pts = [];
    for (let i = 0; i < n; i++) {
        const a = (i * TWO_PI) / n;
        const r = 280 + 40 * sin(3 * a);
        pts.push(createVector(cos(a) * r, sin(a) * r, 130 * sin(2 * a + 1)));
    }
    const lap = new Spline(pts[n - 1], pts[0], pts[1], pts[2], pts[3], pts[4], pts[5], pts[6], pts[0], pts[1]);
    const twoLaps = new Curve(lap, lap);
    comet = Keyed.ofVector()
        .key(0, twoLaps)
        .key(D, twoLaps)
        .addEffect(new Wiggle(createVector(12, 12, 12), 2, 7));

    // Impacts: a marker on each scene pin, and onLoop for the first one.
    for (let i = 1; i < 4; i++) {
        const k = i;
        tm.addMarker(names[k], scene[k], () => impact(k));
    }
    tm.onLoop(() => impact(0));

    // Dust around the stage, for parallax once the camera moves.
    randomSeed(3);
    dust = [];
    for (let i = 0; i < 260; i++) {
        dust.push(randomUnitVector3().mult(random(240, 520)));
    }
}

function impact(i) {
    waves.push(new Shockwave(palette[i]));
}

function draw() {
    if (scrubbing) {
        const t = map(constrain(mouseX, barX0, barX1), barX0, barX1, 0, D);
        // true fires the markers on the way, so scrubbing still triggers impacts.
        tm.to(min(t, D - 0.001), true);
    }

    const ac = accent.value();
    let back = bg;
    for (const w of waves) {
        back = lerpColor(back, w.col, w.flash.value() * 0.14);
    }
    background(back);

    const gl = drawingContext;
    gl.disable(gl.DEPTH_TEST);
    blendMode(ADD);

    push();
    translate(0, -30);
    scale(zoom);
    cam.value().apply();
    rotateZ(spin.value());

    drawDust();
    drawFloor();
    drawCore(ac);
    drawMoons(ac);
    drawComet(ac);
    drawWaves();

    pop();

    blendMode(BLEND);
    gl.enable(gl.DEPTH_TEST);

    // Warp first, so the bloom glows the warped picture. Neither touches the HUD drawn after it.
    if (warpOn) {
        warp.setUniform('waves', warpWaves());
        filter(warp);
    }

    if (bloomOn) {
        bloom.setUniform('threshold', 0.2);
        bloom.setUniform('strength', 1.6);
        bloom.setUniform('radius', 12 * pixelDensity());
        filter(bloom);
    }

    drawHud(ac);

    push();
    resetMatrix();
    translate(-width / 2, -height / 2);
    image(overlay, 0, 0);
    pop();
}

// The newest impacts as flat (x, y, radius, strength) groups. Strength 0 switches a slot off.
function warpWaves() {
    const data = new Array(MAX_WARPS * 4).fill(0);
    const active = waves.slice(-MAX_WARPS);
    active.forEach((w, i) => {
        // The scene's origin on screen: the canvas center, moved up by the translate(0, -30).
        data[i * 4] = width / 2;
        data[i * 4 + 1] = height / 2 - 30;
        data[i * 4 + 2] = w.warpRadius.value() * zoom;
        data[i * 4 + 3] = w.warpStrength.value() * 34;
    });
    return data;
}

function drawDust() {
    stroke(255, 70);
    strokeWeight(2);
    for (const p of dust) {
        point(p.x, p.y, p.z);
    }
}

// A polar grid below the shape. Seen flat it's a radar; tilted, a floor.
function drawFloor() {
    push();
    translate(0, 0, -190);
    noFill();
    stroke(255, 22);
    strokeWeight(1);
    for (let r = 80; r <= 400; r += 80) {
        circle(0, 0, r * 2);
    }
    for (let i = 0; i < 16; i++) {
        const a = (i * TWO_PI) / 16;
        line(cos(a) * 80, sin(a) * 80, cos(a) * 400, sin(a) * 400);
    }
    pop();
}

function drawCore(ac) {
    // Echoes of the shape a moment ago: ghosting while it wobbles.
    const ghosts = core.echo(6, 0.045);
    noFill();
    strokeWeight(1.5);
    for (let i = ghosts.length - 1; i > 0; i--) {
        strokeRgb(ac, 70 - i * 10);
        outline(ghosts[i]);
    }

    const s = ghosts[0];
    stroke(255, 210);
    strokeWeight(2.5);
    outline(s);

    // Stems down to the floor show the depth.
    strokeRgb(ac, 40);
    strokeWeight(1);
    for (let i = 0; i < N; i += 6) {
        const p = s.points[i];
        line(p.x, p.y, p.z, p.x, p.y, -190);
    }

    strokeRgb(ac, 230);
    strokeWeight(5);
    for (let i = 0; i < N; i += 6) {
        const p = s.points[i];
        point(p.x, p.y, p.z);
    }

    // Two sparks racing around the outline.
    const head = (tm.t() / D) * N * 3;
    for (let k = 0; k < 2; k++) {
        for (let j = 0; j < 14; j++) {
            const idx = (((head | 0) - j + k * (N / 2) + N * 4) % N + N) % N;
            const p = s.points[idx];
            stroke(255, 255 - j * 18);
            strokeWeight(9 - j * 0.5);
            point(p.x, p.y, p.z);
        }
    }
}

function drawMoons(ac) {
    for (const moon of moons) {
        const trail = moon.echo(30, 0.022);
        for (let i = trail.length - 1; i > 0; i--) {
            const a = trail[i];
            const b = trail[i - 1];
            strokeRgb(ac, map(i, 0, trail.length, 200, 0));
            strokeWeight(map(i, 0, trail.length, 6, 1));
            line(a.x, a.y, a.z, b.x, b.y, b.z);
        }
        const p = trail[0];
        noStroke();
        fillRgb(ac, 60);
        disc(p, 26);
        fill(255);
        disc(p, 11);
    }
}

// A circle at p that always faces the screen: the turntable and the camera are undone around it.
function disc(p, diameter) {
    const q = cam.value();
    push();
    translate(p.x, p.y, p.z);
    rotateZ(-spin.value());
    new Quaternion(q.w, -q.x, -q.y, -q.z).apply();
    circle(0, 0, diameter);
    pop();
}

function drawComet(ac) {
    const tail = comet.echo(40, 0.018);
    for (let i = tail.length - 1; i > 0; i--) {
        const a = tail[i];
        const b = tail[i - 1];
        stroke(255, map(i, 0, tail.length, 220, 0));
        strokeWeight(map(i, 0, tail.length, 8, 0.5));
        line(a.x, a.y, a.z, b.x, b.y, b.z);
    }
    const p = tail[0];
    noStroke();
    fillRgb(ac, 90);
    disc(p, 30);
}

function drawWaves() {
    for (let i = waves.length - 1; i >= 0; i--) {
        const wave = waves[i];
        wave.draw();
        if (wave.isFinished()) {
            wave.dispose();
            waves.splice(i, 1);
        }
    }
}

function drawHud(ac) {
    const t = tm.t();

    overlay.clear();
    overlay.textFont('monospace');
    // The stroke set for the bar last frame would outline the text.
    overlay.noStroke();

    overlay.fill(255);
    overlay.textAlign(LEFT, TOP);
    overlay.textSize(18);
    overlay.text('KEYED', 40, 32);
    overlay.fill(255, 120);
    overlay.textSize(11);
    overlay.text('keyframes for p5.js', 40, 56);

    overlay.textAlign(RIGHT, TOP);
    overlay.textSize(14);
    overlay.fill(255);
    overlay.text(`${nf(t, 2, 2)} s`, barX1, 32);
    overlay.fill(ac);
    overlay.textSize(11);
    overlay.text(`zoom ${nf(zoom, 1, 2)}`, barX1, 56);

    // The word, morphed by StringLerp under a Lag.
    overlay.fill(255);
    overlay.textAlign(LEFT, BOTTOM);
    overlay.textSize(40);
    overlay.text(word.value(), 40, 538);

    // value(t) reads any time, so the whole spring can be graphed.
    overlay.noFill();
    overlay.stroke(red(ac), green(ac), blue(ac), 160);
    overlay.strokeWeight(1.5);
    overlay.beginShape();
    for (let x = barX0; x <= barX1; x += 2) {
        const z = zoomKeyed.value(map(x, barX0, barX1, 0, D));
        overlay.vertex(x, map(z, 0.85, 1.25, 586, 552));
    }
    overlay.endShape();

    overlay.stroke(255, 50);
    overlay.strokeWeight(1);
    overlay.line(barX0, barY, barX1, barY);

    // A diamond per key of the hero shape, on the pins.
    overlay.noStroke();
    for (const k of core.keys()) {
        const x = map(k.t(), 0, D, barX0, barX1);
        overlay.fill(255, 160);
        overlay.quad(x, barY - 5, x + 5, barY, x, barY + 5, x - 5, barY);
    }

    overlay.textAlign(CENTER, TOP);
    overlay.textSize(10);
    for (let i = 0; i < 4; i++) {
        const x = map(scene[i].t(), 0, D, barX0, barX1);
        overlay.fill(palette[i]);
        overlay.text(names[i], x, barY + 10);
    }

    const x = map(t, 0, D, barX0, barX1);
    overlay.stroke(red(ac), green(ac), blue(ac));
    overlay.strokeWeight(2);
    overlay.line(x, barY - 14, x, barY + 6);
}

function outline(shape) {
    beginShape();
    shape.vertices();
    endShape(CLOSE);
}

function rippled(shape, t) {
    const amp = rippleAmp.value(t);
    const n = shape.points.length;
    const pts = [];
    for (let i = 0; i < n; i++) {
        const p = shape.points[i].copy();
        // A period of 2 seconds fits the 12 second loop 6 times.
        p.z += amp * sin(TWO_PI * ((4 * i) / n - t / 2));
        pts.push(p);
    }
    return new ShapeMorph(pts);
}

// All shapes have N points and start at the top, so they morph without twisting.

function makeCircleShape(r) {
    const pts = [];
    for (let i = 0; i < N; i++) {
        const a = -HALF_PI + (i * TWO_PI) / N;
        pts.push(createVector(cos(a) * r, sin(a) * r, 0));
    }
    return new ShapeMorph(pts);
}

function makeKnotShape(s) {
    const pts = [];
    for (let i = 0; i < N; i++) {
        const t = (i * TWO_PI) / N;
        pts.push(createVector(
            (sin(t) + 2 * sin(2 * t)) * s,
            (cos(t) - 2 * cos(2 * t)) * s,
            -sin(3 * t) * s * 1.3,
        ));
    }
    return new ShapeMorph(pts);
}

function makeStarShape(spikes, outer, inner) {
    const corners = [];
    for (let i = 0; i < spikes * 2; i++) {
        const a = -HALF_PI + (i * PI) / spikes;
        const r = i % 2 === 0 ? outer : inner;
        corners.push(createVector(cos(a) * r, sin(a) * r, 0));
    }

    // Evenly filled edges, so it has N points like the others.
    const pts = [];
    const perEdge = N / corners.length;
    for (let i = 0; i < corners.length; i++) {
        const a = corners[i];
        const b = corners[(i + 1) % corners.length];
        for (let j = 0; j < perEdge; j++) {
            pts.push(p5.Vector.lerp(a, b, j / perEdge));
        }
    }
    return new ShapeMorph(pts);
}

function makeFlowerShape() {
    const pts = [];
    for (let i = 0; i < N; i++) {
        const a = -HALF_PI + (i * TWO_PI) / N;
        const r = 150 + 35 * cos(6 * (a + HALF_PI));
        pts.push(createVector(cos(a) * r, sin(a) * r, 60 * cos(3 * (a + HALF_PI))));
    }
    return new ShapeMorph(pts);
}

// Same rotation as rotateX(x), rotateY(y), rotateZ(z).
function euler(x, y, z) {
    return Quaternion.fromAxisAngle(createVector(1, 0, 0), x)
        .mult(Quaternion.fromAxisAngle(createVector(0, 1, 0), y))
        .mult(Quaternion.fromAxisAngle(createVector(0, 0, 1), z));
}

function randomUnitVector3() {
    const z = random(-1, 1);
    const a = random(TWO_PI);
    const r = sqrt(max(0, 1 - z * z));
    return createVector(r * cos(a), r * sin(a), z);
}

function strokeRgb(col, alpha) {
    stroke(red(col), green(col), blue(col), alpha);
}

function fillRgb(col, alpha) {
    fill(red(col), green(col), blue(col), alpha);
}

function mousePressed() {
    if (mouseY > barY - 40) {
        scrubbing = true;
        tm.play(false);
    }
}

function mouseReleased() {
    if (scrubbing) {
        scrubbing = false;
        tm.play(true);
    }
}

function keyPressed() {
    if (key === ' ') {
        tm.play(!tm.isPlaying());
    } else if ((key === 'b' || key === 'B') && bloom) {
        bloomOn = !bloomOn;
    } else if ((key === 'w' || key === 'W') && warp) {
        warpOn = !warpOn;
    }
}

function isMobile() {
    const uaMobile = navigator.userAgentData?.mobile;
    if (uaMobile !== undefined) {
        return uaMobile;
    }
    return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
        // iPadOS reports itself as a Mac.
        || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}
