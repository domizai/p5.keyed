let intro;
let angle;
let cardY;
let cardAlpha;

function setup() {
    createCanvas(400, 400);

    // The default timeline loops every second.
    Keyed.init().setDuration(1);
    textFont('monospace');
    textAlign(CENTER, CENTER);

    // Without setTimeline(), values follow the default timeline.
    angle = Keyed.ofFloat()
        .key(0, 0)
        .key(1, TWO_PI);

    // A second timeline that plays once: false turns looping off,
    // so it stops at the end instead of starting over.
    intro = new Timeline().setDuration(1.2, false);

    cardY = Keyed.ofFloat()
        .setTimeline(intro)
        .key(Key.at(0).setEasing(Easing.CUBIC_OUT), 420)
        .key(1.2, 180);

    cardAlpha = Keyed.ofFloat()
        .setTimeline(intro)
        .key(0, 0)
        .key(0.6, 255);
}

function draw() {
    background(255);

    // The spinner keeps turning, whatever happens to the intro.
    noFill();
    stroke(0);
    strokeWeight(4);
    const a = angle.value();
    arc(200, 70, 50, 50, a, a + PI * 1.5);
    strokeWeight(1);

    // text() is outlined by the current stroke in p5.
    noStroke();
    fill(150);
    text(`intro finished: ${intro.isFinished()}`, 200, 130);

    noStroke();
    fill(0, cardAlpha.value());
    rect(80, cardY.value(), 240, 140, 12);
    fill(255, cardAlpha.value());
    text('click to replay', 200, cardY.value() + 70);
}

function mousePressed() {
    // Restarts only the intro; the default timeline is unaffected.
    intro.to(0);
}
