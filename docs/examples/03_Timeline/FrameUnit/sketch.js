const fps = 30;

let synced;
let stepped;
let a;
let b;

function setup() {
    createCanvas(400, 400);
    frameRate(fps);
    textFont('monospace');

    // Keyed can't read the sketch's frame rate, so pass the same value.
    Keyed.setFrameRate(fps);
    // Count time in frames instead of seconds, for every timeline created afterwards.
    Keyed.setUnit(Keyed.FRAME);
    Keyed.init();

    // Follows the real clock, measured in frames.
    // If draw() is slow it skips ahead to stay on time.
    synced = new Timeline().setDuration(90);

    // Advances exactly one frame per draw().
    // If draw() is slow it slows down, but never skips a frame.
    stepped = new Timeline().setDuration(90).sync(false);

    a = bounce(synced);
    b = bounce(stepped);
}

// Keys at frames 0, 45 and 90: 3 seconds at 30 fps.
function bounce(tm) {
    return Keyed.ofFloat()
        .setTimeline(tm)
        .key(Key.at(0).setEasing(1 / 3), 60)
        .key(Key.at(45).setEasing(1 / 3), 340)
        .key(Key.at(90).setEasing(1 / 3), 60);
}

function draw() {
    // Simulates a heavy sketch while the mouse is held down.
    if (mouseIsPressed) {
        const end = performance.now() + 100;
        while (performance.now() < end) {}
    }

    background(255);

    lane('sync(true)', synced, a, 110);
    lane('sync(false)', stepped, b, 240);

    fill(150);
    text('hold the mouse to slow down draw()', 40, 360);
}

function lane(label, tm, x, y) {
    fill(150);
    text(label, 40, y - 40);
    fill(0);
    text(`frame ${nf(tm.t(), 2, 1)}`, 240, y - 40);

    stroke(220);
    line(60, y, 340, y);
    noStroke();
    fill(0);
    circle(x.value(), y, 30);
}
