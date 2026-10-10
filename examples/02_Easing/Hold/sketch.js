let ticks = 8;
let hand;
let lamp;
let lampColors;
let offLampColor;

function setup() {
    createCanvas(400, 400);

    Keyed.init().setDuration(4);
    textFont('monospace');
    textSize(14);
    textAlign(CENTER, CENTER);

    // Even jumps: one full turn in 8 equal steps,
    // with a stepped easing on a single segment.
    hand = Keyed.ofFloat()
        .key(Key.at(0).setEasing(Easing.steps(ticks)), 0)
        .key(4, TWO_PI);

    // Uneven timing: green for 2 seconds, yellow for 0.5, red for 1.5.
    // hold() keeps a key's value until the next key. Without it the lamp
    // index would be blended and rounded, switching halfway between keys.
    lamp = Keyed.ofInt()
        .key(Key.at(0).hold(), 2)
        .key(Key.at(2).hold(), 1)
        .key(2.5, 0);

    // Red, yellow and green, from top to bottom.
    lampColors = [
        color(230, 60, 60),
        color(240, 190, 40),
        color(60, 180, 90),
    ];
    offLampColor = color(235);
}

function draw() {
    background(255);
    clock('steps(8)', 110, 200, hand.value());
    trafficLight('hold()', 290, 200, lamp.value());
}

function clock(label, x, y, angle) {
    const r = 70;

    noFill();
    stroke(220);
    circle(x, y, r * 2);
    strokeWeight(5);
    for (let i = 0; i < ticks; i++) {
        const a = i * TWO_PI / ticks - HALF_PI;
        point(x + cos(a) * (r - 10), y + sin(a) * (r - 10));
    }

    stroke(0);
    strokeWeight(3);
    const a = angle - HALF_PI;
    line(x, y, x + cos(a) * (r - 20), y + sin(a) * (r - 20));
    strokeWeight(1);

    noStroke();
    fill(150);
    text(label, x, y + 120);
}

function trafficLight(label, x, y, lit) {
    noFill();
    stroke(220);
    rect(x - 35, y - 95, 70, 190, 12);

    noStroke();
    for (let i = 0; i < 3; i++) {
        fill(i === lit ? lampColors[i] : offLampColor);
        circle(x, y - 60 + i * 60, 44);
    }

    fill(150);
    text(label, x, y + 120);
}
