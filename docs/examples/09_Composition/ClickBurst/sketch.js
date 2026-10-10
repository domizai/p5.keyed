const bursts = [];
let colors;

function setup() {
    createCanvas(400, 400);
    textFont('monospace');
    textSize(14);

    colors = [
        color(230, 60, 60),
        color(240, 190, 40),
        color(60, 120, 230),
        color(60, 180, 90),
    ];

    // Starts a burst every 0.4 seconds, so there is something to see.
    Keyed.init()
        .setDuration(0.4)
        .onLoop(() => spawn(random(60, 340), random(60, 320)));
}

function mousePressed() {
    spawn(mouseX, mouseY);
}

// The same Burst every time, but each one gets its own size, color and duration.
// Each one plays on its own, starting right away.
function spawn(x, y) {
    const size = random(0.4, 1.6);
    const col = random(colors);
    // Bigger bursts take longer.
    const duration = 0.4 + 0.5 * size;
    bursts.push(new Burst(x, y, size, col, duration));
}

function draw() {
    background(255);

    // Backwards, so finished bursts can be removed while looping.
    for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i];
        b.draw();
        if (b.isFinished()) {
            // Stops its timeline so it can be garbage collected.
            b.dispose();
            bursts.splice(i, 1);
        }
    }

    // text() is outlined by the current stroke in p5.
    noStroke();
    fill(150);
    text('click anywhere   bursts: ' + bursts.length, 40, 380);
}
