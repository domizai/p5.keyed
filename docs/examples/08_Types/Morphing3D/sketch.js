const n = 60;

let shape;
let spin;
let overlay;

function setup() {
    createCanvas(400, 400, WEBGL);
    Keyed.init().setDuration(8);

    overlay = createGraphics(400, 400);
    overlay.textFont('monospace');
    overlay.textSize(14);
    overlay.fill(150);
    overlay.noStroke();
    overlay.text('ShapeMorph in P3D', 40, 380);

    // ShapeMorph uses x, y and z, so outlines can morph in 3D too.
    shape = Keyed.of(makeCircle())
        .key(Key.at(0).setEasing(0.6), makeCircle())
        .key(Key.at(2).setEasing(0.6), makeWave())
        .key(Key.at(4).setEasing(0.6), makeKnot())
        .key(Key.at(6).setEasing(0.6), makeTriangle())
        .key(Key.at(8).setEasing(0.6), makeCircle());

    // One turn per loop, to see the depth.
    spin = Keyed.ofFloat()
        .key(0, 0)
        .key(8, TWO_PI);
}

// All shapes start at the top, so they don't twist while morphing.

// A flat circle.
function makeCircle() {
    const pts = [];
    for (let i = 0; i < n; i++) {
        const a = -HALF_PI + i * TWO_PI / n;
        pts.push(createVector(cos(a) * 120, sin(a) * 120, 0));
    }
    return new ShapeMorph(pts);
}

// A circle that goes up and down three times.
function makeWave() {
    const pts = [];
    for (let i = 0; i < n; i++) {
        const a = -HALF_PI + i * TWO_PI / n;
        pts.push(createVector(cos(a) * 110, sin(a) * 110, sin(a * 3) * 50));
    }
    return new ShapeMorph(pts);
}

// A trefoil knot.
function makeKnot() {
    const pts = [];
    for (let i = 0; i < n; i++) {
        const t = i * TWO_PI / n;
        pts.push(createVector(
            (sin(t) + 2 * sin(2 * t)) * 40,
            (cos(t) - 2 * cos(2 * t)) * 40,
            -sin(3 * t) * 40,
        ));
    }
    return new ShapeMorph(pts);
}

// Only 3 points: ShapeMorph adds the missing ones along its edges.
function makeTriangle() {
    const pts = [];
    for (let i = 0; i < 3; i++) {
        const a = -HALF_PI + i * TWO_PI / 3;
        pts.push(createVector(cos(a) * 130, sin(a) * 130, 0));
    }
    return new ShapeMorph(pts);
}

function draw() {
    background(255);

    push();
    translate(-width / 2, -height / 2);
    translate(width / 2, height / 2 - 10);
    rotateX(-0.5);
    rotateY(spin.value());

    const s = shape.value();

    // vertices() includes z with a 3D renderer.
    noFill();
    stroke(0);
    strokeWeight(1.5);
    beginShape();
    s.vertices();
    endShape(CLOSE);

    stroke(230, 60, 60);
    strokeWeight(7);
    for (const p of s.points) {
        point(p.x, p.y, p.z);
    }
    strokeWeight(1);
    pop();

    push();
    resetMatrix();
    translate(-width / 2, -height / 2);
    image(overlay, 0, 0);
    pop();
}
