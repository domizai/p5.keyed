const duration = 3;

let arrive;
let x;
let ballSize;
let col;

const barX0 = 40;
const barX1 = 360;
const barY = 340;

function setup() {
    createCanvas(400, 400);
    Keyed.init().setDuration(duration);
    textFont('monospace');
    textAlign(CENTER, CENTER);

    // A Pin is a point in time that several keys can share.
    arrive = Pin.at(1);

    // Pass the pin instead of a time. Key.at(pin) adds easing as usual.
    x = Keyed.ofFloat()
        .key(Key.at(0).setEasing(1 / 3), 60)
        .key(Key.at(arrive).setEasing(1 / 3), 340)
        .key(Key.at(duration).setEasing(1 / 3), 60);

    ballSize = Keyed.ofFloat()
        .key(0, 20)
        .key(arrive, 80)
        .key(duration, 20);

    col = Keyed.ofColor()
        .key(0, color(0))
        .key(arrive, color(230, 60, 60))
        .key(duration, color(0));
}

function draw() {
    background(255);

    if (mouseIsPressed) {
        // Moving the pin moves its key in all three values at once.
        const t = map(mouseX, barX0, barX1, 0, duration);
        arrive.to(constrain(t, 0.2, duration - 0.2));
    }

    noStroke();
    fill(col.value());
    circle(x.value(), 170, ballSize.value());

    // The bar, with the pin and the playhead.
    stroke(220);
    line(barX0, barY, barX1, barY);
    const px = map(arrive.t(), 0, duration, barX0, barX1);
    noStroke();
    fill(230, 60, 60);
    triangle(px - 7, barY - 18, px + 7, barY - 18, px, barY - 6);
    stroke(0);
    const head = map(Keyed.defaultTimeline().t(), 0, duration, barX0, barX1);
    line(head, barY - 12, head, barY + 12);

    noStroke();
    fill(150);
    text(`arrive = ${nf(arrive.t(), 1, 2)} s`, width / 2, barY - 40);
    text('drag to move the pin', width / 2, barY + 30);
}
