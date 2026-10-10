// A Timeline is a clock. It advances by itself before every draw().
let tm;
let loops = 0;
let lastMarker = '-';

const barX0 = 40;
const barX1 = 360;
const barY = 120;
let scrubbing = false;

function setup() {
    createCanvas(400, 400);
    textFont('monospace');

    // Loops every 3 seconds.
    tm = new Timeline().setDuration(3);

    // Markers call back whenever playback crosses them.
    tm.addMarker('one', 1, (m) => (lastMarker = m.name()));
    tm.addMarker('two', 2, (m) => (lastMarker = m.name()));

    tm.onLoop(() => loops++);
    tm.onFinish(() => (lastMarker = 'finished'));
}

function draw() {
    background(255);
    drawBar();
    drawInfo();
}

function drawBar() {
    stroke(225);
    line(barX0, barY, barX1, barY);

    noStroke();
    fill(230, 60, 60);
    textSize(11);
    textAlign(CENTER);
    for (const m of tm.markers()) {
        const x = map(m.t(), 0, tm.duration(), barX0, barX1);
        triangle(x - 6, barY - 22, x + 6, barY - 22, x, barY - 12);
        fill(150);
        text(m.name(), x, barY - 30);
        fill(230, 60, 60);
    }

    const x = map(tm.t(), 0, tm.duration(), barX0, barX1);
    stroke(0);
    line(x, barY - 10, x, barY + 10);
}

function drawInfo() {
    noStroke();
    textSize(14);
    textAlign(LEFT);
    const rows = [
        ['t', nf(tm.t(), 1, 2)],
        ['playing', tm.isPlaying()],
        ['speed', nf(tm.speed(), 1, 1)],
        ['looping', tm.isLooping()],
        ['loops', loops],
        ['marker', lastMarker],
    ];
    rows.forEach(([label, value], i) => {
        fill(0);
        text(label, barX0, 200 + i * 24);
        text(value, barX0 + 110, 200 + i * 24);
    });

    fill(150);
    text('drag the bar to scrub', barX0, 360);
    text('SPACE play/pause  R restart  L loop  LEFT/RIGHT speed', barX0, 380);
}

function mousePressed() {
    scrubbing = abs(mouseY - barY) < 30 && mouseX > barX0 - 10 && mouseX < barX1 + 10;
    if (scrubbing) {
        tm.play(false);
        scrub();
    }
}

function mouseDragged() {
    if (scrubbing) scrub();
}

function mouseReleased() {
    if (scrubbing) tm.play(true);
    scrubbing = false;
}

// fire = true so markers react to scrubbing like to playback.
function scrub() {
    const t = map(constrain(mouseX, barX0, barX1), barX0, barX1, 0, tm.duration());
    tm.to(t, true);
}

function keyPressed() {
    const k = key.toLowerCase();
    if (k === ' ') tm.play(!tm.isPlaying());
    if (k === 'r') tm.to(0);
    if (k === 'l') tm.loop(!tm.isLooping());
    if (key === LEFT_ARROW) tm.setSpeed(tm.speed() - 0.5);
    if (key === RIGHT_ARROW) tm.setSpeed(tm.speed() + 0.5);
}
