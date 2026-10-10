let c;
let q;

let cubic;
let quad;
let a;
let b;

const drawPath = (path) => {
    // A path is a Tween<p5.Vector>: value(d) is the point at d, from 0 to 1.
    noFill();
    stroke(200);
    beginShape();
    for (let i = 0; i <= 100; i++) {
        const v = path.value(i / 100);
        vertex(v.x, v.y);
    }
    endShape();

    // Paths are traveled at constant speed, so even steps in d are evenly spaced.
    noStroke();
    fill(200);
    for (let i = 0; i <= 10; i++) {
        const v = path.value(i / 10);
        circle(v.x, v.y, 6);
    }
};

const handle = (anchor, control) => {
    stroke(230);
    line(anchor.x, anchor.y, control.x, control.y);
    noStroke();
    fill(230);
    rectMode(CENTER);
    rect(control.x, control.y, 8, 8);
    rectMode(CORNER);
};

window.setup = () => {
    createCanvas(400, 400);
    Keyed.init().setDuration(3);
    textFont('monospace');
    textSize(14);

    c = [
        createVector(60, 140), createVector(120, 50),
        createVector(280, 190), createVector(340, 100),
    ];
    q = [
        createVector(60, 340), createVector(200, 190), createVector(340, 340),
    ];

    cubic = new CubicBezier(c[0], c[1], c[2], c[3]);
    quad = new QuadraticBezier(q[0], q[1], q[2]);

    // A key can follow a path instead of holding a fixed value.
    // Two keys on the same path travel along all of it, start to end.
    a = Keyed.ofVector()
        .key(0, cubic)
        .key(3, cubic);

    // at() pins a key to one position on the path: 0 is the start, 1 the end.
    // From at(0) to at(1) and back to at(0) goes there and back again.
    // Easing works as usual, shaping the progress along the path.
    b = Keyed.ofVector()
        .key(Key.at(0).setEasing(1 / 3), quad.at(0))
        .key(Key.at(1.5).setEasing(1 / 3), quad.at(1))
        .key(Key.at(3).setEasing(1 / 3), quad.at(0));
};

window.draw = () => {
    background(255);

    handle(c[0], c[1]);
    handle(c[3], c[2]);
    handle(q[0], q[1]);
    handle(q[2], q[1]);

    drawPath(cubic);
    drawPath(quad);

    noStroke();
    fill(0);
    const pa = a.value();
    circle(pa.x, pa.y, 24);
    const pb = b.value();
    circle(pb.x, pb.y, 24);

    fill(150);
    text('CubicBezier', 40, 30);
    text('QuadraticBezier with at()', 40, 380);
};
