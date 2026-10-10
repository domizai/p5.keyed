let once;
let x;
let progress;

let loops = 0;
let finishes = 0;
let doneFlash = 0;

function setup() {
    createCanvas(400, 400);
    const tm = Keyed.init().setDuration(1);
    textFont('monospace');

    x = Keyed.ofFloat()
        .key(Key.at(0).setEasing(1 / 3), 60)
        .key(Key.at(0.5).setEasing(1 / 3), 340)
        .key(Key.at(1).setEasing(1 / 3), 60);

    // Called every time a looping timeline wraps around.
    // To stop it later, keep the lambda in a variable and pass it to removeListener().
    tm.onLoop(() => loops++);

    // Plays once, in 2 seconds.
    once = new Timeline().setDuration(2, false);
    progress = Keyed.ofFloat()
        .setTimeline(once)
        .key(0, 0)
        .key(2, 1);

    // Called once when a non-looping timeline reaches its end.
    once.onFinish(() => {
        finishes++;
        doneFlash = 255;
    });
}

function draw() {
    background(255);
    noStroke();

    fill(150);
    text(`onLoop    loops: ${loops}`, 40, 70);
    fill(0);
    circle(x.value(), 120, 30);

    fill(150);
    text(`onFinish  finishes: ${finishes}`, 40, 230);
    fill(235);
    rect(40, 260, 320, 20);
    fill(0);
    rect(40, 260, 320 * progress.value(), 20);

    fill(230, 60, 60, doneFlash);
    text('done!', 40, 310);
    doneFlash *= 0.95;

    fill(150);
    text('click to restart the bar', 40, 370);
}

function mousePressed() {
    // After restarting, onFinish fires again at the end.
    once.to(0);
}
