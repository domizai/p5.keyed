// Plain variables. Their values here become the defaults.
// Top-level var variables are properties of window, so they can be bound by name; let and const are not.
var x = 60;
var diameter = 20;

function setup() {
    createCanvas(400, 400);
    Keyed.init().setDuration(3);
    textFont('monospace');
    textSize(14);

    // bind(object, "property") writes the animated value into a property
    // before every draw(). It works for properties of any object,
    // e.g. Keyed.bind(ball, "x"); here the object is window.
    Keyed.bind(window, 'x')
        .key(Key.at(0).setEasing(1 / 3), 60)
        .key(Key.at(1.5).setEasing(1 / 3), 340)
        .key(Key.at(3).setEasing(1 / 3), 60);

    Keyed.bind(window, 'diameter')
        .key(0, 20)
        .key(1.5, 80)
        .key(3, 20);
}

function draw() {
    background(255);

    // No value() calls: x and diameter are plain numbers, already up to date.
    noStroke();
    fill(0);
    circle(x, 180, diameter);

    fill(150);
    text(`x = ${nf(x, 1, 1)}`, 40, 330);
    text(`diameter = ${nf(diameter, 1, 1)}`, 40, 355);
}
