let tm;
let pos;

const barX0 = 40;
const barX1 = 360;
const barY = 340;

function setup() {
    createCanvas(400, 400);

    // Call init() first: timelines created after it advance with the sketch.
    Keyed.init();
    textFont('monospace');
    textAlign(CENTER, CENTER);

    tm = new Timeline().setDuration(4);

    pos = Keyed.ofVector()
        .setTimeline(tm)
        .key(Key.at(0).setEasing(1 / 3), createVector(80, 80))
        .key(Key.at(1).setEasing(1 / 3), createVector(320, 80))
        .key(Key.at(2.5).setEasing(1 / 3), createVector(320, 260))
        .key(Key.at(4).setEasing(1 / 3), createVector(80, 80));
}

function draw() {
    background(255);

    if (mouseIsPressed) {
        // to() jumps straight to a time.
        const t = map(constrain(mouseX, barX0, barX1), barX0, barX1, 0, tm.duration());
        tm.to(t);
    }

    const p = pos.value();
    noStroke();
    fill(0);
    circle(p.x, p.y, 40);

    // The bar, with a tick for every key.
    stroke(220);
    line(barX0, barY, barX1, barY);
    for (const k of pos.keys()) {
        const kx = map(k.t(), 0, tm.duration(), barX0, barX1);
        line(kx, barY - 6, kx, barY + 6);
    }

    // The playhead.
    stroke(0);
    const head = map(tm.t(), 0, tm.duration(), barX0, barX1);
    line(head, barY - 12, head, barY + 12);

    noStroke();
    fill(150);
    text('drag to scrub', width / 2, barY + 30);
}

// Pause while dragging, so the timeline doesn't advance on its own.
function mousePressed() {
    tm.play(false);
}

function mouseReleased() {
    tm.play(true);
}
