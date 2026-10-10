let duration = 4;
let ballY;

// The graph maps time 0..duration to x.
let gx0 = 40;
let gx1 = 300;

function setup() {
    createCanvas(400, 400);

    Keyed.init().setDuration(duration);
    textFont('monospace');
    textSize(14);

    // The ball's height over time.
    ballY = Keyed.ofFloat()
        .key(Key.at(0).setEasing(1 / 3), 300)
        .key(Key.at(1).setEasing(1 / 3), 100)
        .key(Key.at(2.5).setEasing(1 / 3), 220)
        .key(Key.at(4).setEasing(1 / 3), 300);
}

function draw() {
    background(255);

    // value(t) gives the value at any time, not just the current one.
    // Here it draws the whole animation as a graph, one point per pixel.
    noFill();
    stroke(220);
    beginShape();
    for (let x = int(gx0); x <= gx1; x++) {
        const t = map(x, gx0, gx1, 0, duration);
        vertex(x, ballY.value(t));
    }
    endShape();

    // The keys, on the curve.
    noStroke();
    fill(150);
    for (const k of ballY.keys()) {
        circle(tx(k.t()), ballY.value(k.t()), 8);
    }

    // value() is the value at the timeline's current time, so the playhead
    // always sits on the curve, at the same height as the ball.
    const now = Keyed.defaultTimeline().t();
    const y = ballY.value();
    stroke(220);
    line(tx(now), 60, tx(now), 340);
    line(tx(now), y, 350, y);
    noStroke();
    fill(0);
    circle(tx(now), y, 10);
    circle(350, y, 40);
    text('value()      = ' + nf(y, 1, 1), 40, 360);

    // Hover over the graph to read the value at any other time.
    if (mouseX >= gx0 && mouseX <= gx1) {
        const t = map(mouseX, gx0, gx1, 0, duration);
        const v = ballY.value(t);
        noFill();
        stroke(230, 60, 60);
        circle(mouseX, v, 14);
        noStroke();
        fill(230, 60, 60);
        text('value(' + nf(t, 1, 2) + ') = ' + nf(v, 1, 1), 40, 380);
    } else {
        fill(150);
        text('hover over the graph', 40, 380);
    }
}

function tx(t) {
    return map(t, 0, duration, gx0, gx1);
}
