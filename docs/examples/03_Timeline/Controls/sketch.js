let tm;
let x;

function setup() {
    createCanvas(400, 400);
    Keyed.init();
    textFont('monospace');

    // A timeline of our own, 3 seconds long and looping.
    tm = new Timeline().setDuration(3);

    // setTimeline() makes x follow tm instead of the default timeline.
    x = Keyed.ofFloat()
        .setTimeline(tm)
        .key(Key.at(0).setEasing(1 / 3), 60)
        .key(Key.at(1.5).setEasing(1 / 3), 340)
        .key(Key.at(3).setEasing(1 / 3), 60);
}

function draw() {
    background(255);

    noStroke();
    fill(0);
    circle(x.value(), 100, 40);

    // Progress bar with the playhead.
    stroke(220);
    line(40, 160, 360, 160);
    stroke(0);
    const head = map(tm.t(), 0, tm.duration(), 40, 360);
    line(head, 150, head, 170);

    fill(0);
    text(`t         ${nf(tm.t(), 1, 2)}`, 40, 210);
    text(`playing   ${tm.isPlaying()}`, 40, 235);
    text(`speed     ${nf(tm.speed(), 1, 1)}`, 40, 260);
    text(`looping   ${tm.isLooping()}`, 40, 285);
    text(`finished  ${tm.isFinished()}`, 40, 310);

    fill(150);
    text('SPACE play/pause   R restart', 40, 350);
    text('LEFT/RIGHT speed   L loop', 40, 370);
}

function keyPressed() {
    if (key === ' ') {
        tm.play(!tm.isPlaying());
    } else if (key.toLowerCase() === 'r') {
        // Jumps back to the start.
        tm.to(0);
    } else if (key.toLowerCase() === 'l') {
        // Without looping the timeline stops at its duration.
        tm.loop(!tm.isLooping());
    } else if (key === RIGHT_ARROW) {
        tm.setSpeed(tm.speed() + 0.5);
    } else if (key === LEFT_ARROW) {
        // Negative speeds play backwards.
        tm.setSpeed(tm.speed() - 0.5);
    }
}
