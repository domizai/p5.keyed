const duration = 6;
const ground = 60;

let pts;
let track;
let shadowPath;
let ball;
let shadow;
let spin;
let overlay;

function setup() {
    createCanvas(400, 400, WEBGL);
    Keyed.init().setDuration(duration);

    overlay = createGraphics(400, 400);
    overlay.textFont('monospace');
    overlay.textSize(14);
    overlay.fill(150);
    overlay.noStroke();
    overlay.text('Spline in P3D', 40, 380);

    // Six points around a circle on the ground (x and z),
    // alternating high and low (y points down in Processing).
    const n = 6;
    pts = [];
    for (let i = 0; i < n; i++) {
        const a = i * TWO_PI / n;
        const y = i % 2 === 0 ? -80 : 30;
        pts.push(createVector(cos(a) * 130, y, sin(a) * 130));
    }

    // Paths use x, y and z, so they work in 3D just like in 2D.
    // Wrapping the points around closes the loop, as in SplinePath.
    track = new Spline(pts[n - 1], pts[0], pts[1], pts[2], pts[3], pts[4], pts[5], pts[0], pts[1]);

    ball = Keyed.ofVector()
        .key(0, track)
        .key(duration, track);

    // map() flattens the track onto the ground, for the shadow.
    shadowPath = track.map((p) => createVector(p.x, ground, p.z));
    shadow = Keyed.ofVector()
        .key(0, shadowPath)
        .key(duration, shadowPath);

    // Half a turn per loop, to see the depth.
    spin = Keyed.ofFloat()
        .key(0, 0)
        .key(duration, PI);
}

function draw() {
    background(255);

    lights();
    rotateX(-0.45);
    rotateY(spin.value());

    // The track's shadow on the ground.
    noFill();
    stroke(230);
    drawPath(shadowPath);

    // The track.
    stroke(0);
    strokeWeight(2);
    drawPath((d) => track.value(d));
    strokeWeight(1);

    // Posts from the ground up to each point.
    stroke(220);
    for (const p of pts) {
        line(p.x, ground, p.z, p.x, p.y, p.z);
    }

    const s = shadow.value();
    const b = ball.value();
    stroke(230, 60, 60, 120);
    line(s.x, s.y, s.z, b.x, b.y, b.z);

    noStroke();
    fill(200);
    push();
    translate(s.x, s.y, s.z);
    rotateX(HALF_PI);
    circle(0, 0, 20);
    pop();

    fill(230, 60, 60);
    push();
    translate(b.x, b.y, b.z);
    sphere(12);
    pop();

    push();
    resetMatrix();
    translate(-width / 2, -height / 2);
    image(overlay, 0, 0);
    pop();
}

const drawPath = (path) => {
    beginShape();
    for (let i = 0; i <= 200; i++) {
        const v = path(i / 200);
        vertex(v.x, v.y, v.z);
    }
    endShape();
};
