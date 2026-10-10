const fps = 30;
const duration = 3;

let tm;
let angle;
let spread;

let requested = false;
let recording = false;

function setup() {
    createCanvas(400, 400);
    frameRate(fps);
    textFont('monospace');
    textSize(14);

    tm = Keyed.init().setDuration(duration);

    // Every draw() advances exactly 1/30 second, however long it takes,
    // e.g. while saving frames. The frames are then evenly timed
    // and the exported animation plays at the right speed.
    // Keyed.sync(false) with Keyed.setFrameRate(fps) does the same
    // for all timelines.
    tm.setFixedStep(1 / fps);

    // Records exactly one loop: starts when the loop begins.
    tm.onLoop(async () => {
        if (requested) {
            requested = false;
            recording = true;
            // saveGif() stops the sketch, then calls draw() once per frame and
            // saves exactly duration * frameRate frames: one loop of the timeline.
            // It downloads SaveFrames.gif when it is done.
            await saveGif('SaveFrames', duration);
            recording = false;
        }
    });

    angle = Keyed.ofFloat()
        .key(Key.at(0).setEasing(Easing.CUBIC_IN_OUT), 0)
        .key(duration, TWO_PI / 3);

    spread = Keyed.ofFloat()
        .key(Key.at(0).setEasing(1 / 3), 60)
        .key(Key.at(duration / 2).setEasing(1 / 3), 130)
        .key(Key.at(duration).setEasing(1 / 3), 60);
}

function draw() {
    background(255);

    push();
    translate(width / 2, height / 2);
    rotate(angle.value());
    noStroke();
    for (let i = 0; i < 6; i++) {
        const a = (i * TWO_PI) / 6;
        fill(i % 2 === 0 ? color(0) : color(230, 60, 60));
        circle(cos(a) * spread.value(), sin(a) * spread.value(), 50);
    }
    pop();

    // saveGif() saves what is on the canvas after draw(), so the status text
    // is left out while recording.
    if (recording) return;

    // text() is outlined by the current stroke in p5.
    noStroke();
    fill(150);
    if (requested) {
        text('recording starts with the next loop', 20, 30);
    } else {
        text('press R to record one loop as a GIF', 20, 30);
    }
}

// To save a numbered PNG sequence instead, call saveCanvas(nf(frame, 4), 'png')
// at the end of draw() while recording, and count the frames yourself.
function keyPressed() {
    if ((key === 'r' || key === 'R') && !recording) {
        requested = true;
    }
}
