let curve;
let reversed;
let progress;
let back;

const drawPath = (path, col, weight) => {
    noFill();
    stroke(col);
    strokeWeight(weight);
    beginShape();
    for (let i = 0; i <= 150; i++) {
        const v = path.value(i / 150);
        vertex(v.x, v.y);
    }
    endShape();
    strokeWeight(1);
};

window.setup = () => {
    createCanvas(400, 400);
    Keyed.init().setDuration(4);
    textFont('monospace');
    textSize(14);

    // add() chains paths into a Curve, played one after another at even speed.
    // Each path starts where the previous one ends.
    curve = new CubicBezier(
        createVector(60, 330), createVector(60, 200),
        createVector(180, 220), createVector(180, 140),
    ).add(new QuadraticBezier(
        createVector(180, 140), createVector(180, 50), createVector(260, 60),
    )).add(new CubicBezier(
        createVector(260, 60), createVector(360, 70),
        createVector(370, 220), createVector(300, 300),
    ));

    // Draws the curve on in 3 seconds, then holds for 1.
    progress = Keyed.ofFloat()
        .key(Key.at(0).setEasing(1 / 3), 0)
        .key(Key.at(3).setEasing(1 / 3), 1);

    // slice(t0, t1) is the part of a path between t0 and t1.
    // With t1 < t0 it runs backwards.
    reversed = curve.slice(1, 0);
    back = Keyed.ofVector()
        .key(0, reversed)
        .key(4, reversed);
};

window.draw = () => {
    background(255);

    drawPath(curve, 220, 1);

    // Only the first part of the curve, growing with progress.
    const p = progress.value();
    drawPath(curve.slice(0, p), 0, 4);
    const tip = curve.value(p);
    noStroke();
    fill(0);
    circle(tip.x, tip.y, 12);

    const b = back.value();
    fill(230, 60, 60);
    circle(b.x, b.y, 24);

    fill(0);
    text('slice(0, progress)', 40, 360);
    fill(230, 60, 60);
    text('slice(1, 0)', 40, 380);
};
