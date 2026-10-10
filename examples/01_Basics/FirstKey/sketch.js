// An animated float: its value changes over time, blending from key to key.
let x;

function setup() {
    createCanvas(400, 400);

    // Connects Keyed to the sketch so animations follow real time.
    // It returns the default timeline, which we loop every 2 seconds.
    Keyed.init().setDuration(2);

    // Each key is a time in seconds and a value.
    x = Keyed.ofFloat()
        .key(0, 50)
        .key(1, 350)
        .key(2, 50);
}

function draw() {
    background(255);
    noStroke();
    fill(0);
    // value() is the value at the current time.
    circle(x.value(), height / 2, 40);
}
