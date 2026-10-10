let pts;

let spline;
let pos;
let tightness = 0;

window.setup = () => {
    createCanvas(400, 400);
    Keyed.init().setDuration(5);
    textFont('monospace');
    textSize(14);

    pts = [
        createVector(200, 60),
        createVector(340, 170),
        createVector(290, 330),
        createVector(110, 330),
        createVector(60, 170),
    ];

    // Like curveVertex(): the curve passes through every point except
    // the first and last, which only shape its ends. Wrapping the points
    // around like this closes the loop.
    spline = new Spline(pts[4], pts[0], pts[1], pts[2], pts[3], pts[4], pts[0], pts[1]);

    pos = Keyed.ofVector()
        .key(0, spline)
        .key(5, spline);
};

window.mouseMoved = () => {
    // Same as curveTightness(): 0 is round, 1 gives straight lines.
    tightness = constrain(map(mouseX, 40, 360, 0, 1), 0, 1);
    spline.setTightness(tightness);
};

window.draw = () => {
    background(255);

    noFill();
    stroke(200);
    beginShape();
    for (let i = 0; i <= 200; i++) {
        const v = spline.value(i / 200);
        vertex(v.x, v.y);
    }
    endShape();

    noStroke();
    fill(200);
    for (const p of pts) {
        circle(p.x, p.y, 10);
    }

    const p = pos.value();
    fill(0);
    circle(p.x, p.y, 24);

    fill(150);
    text(`tightness ${nf(tightness, 1, 2)}   move the mouse`, 40, 380);
};
