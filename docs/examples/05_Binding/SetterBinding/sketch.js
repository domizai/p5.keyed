let bg;
let label = '';
let score;
let bound = true;

function setup() {
    createCanvas(400, 400);
    Keyed.init().setDuration(4);
    textFont('monospace');
    textAlign(CENTER, CENTER);

    // A Lerp, a default value and a setter, which receives
    // the animated value before every draw().
    Keyed.bind(new ColorLerp(), color(255), (c) => (bg = c))
        .key(0, color(255, 235, 215))
        .key(2, color(215, 230, 255))
        .key(4, color(255, 235, 215));

    // Or bind an existing Keyed. The setter can convert the value,
    // here from a number into a line of text.
    score = Keyed.ofInt()
        .key(0, 0)
        .key(4, 100)
        .bind(showScore);

    // apply() writes the value right away, without waiting for draw(),
    // e.g. to use label in setup().
    score.apply();
    console.log(label);
}

function showScore(v) {
    label = `score ${v}`;
}

function draw() {
    // No value() calls: bg and label are already up to date.
    background(bg);

    // text() is outlined by the current stroke in p5.
    noStroke();
    fill(0);
    textSize(32);
    text(label, width / 2, 180);

    fill(150);
    textSize(14);
    text(bound ? 'click to unbind' : 'unbound, click to bind', width / 2, 350);
}

function mousePressed() {
    // unbind() stops the updates, so label keeps its last value.
    // bind() starts them again.
    bound = !bound;
    if (bound) {
        score.bind(showScore);
    } else {
        score.unbind();
    }
}
