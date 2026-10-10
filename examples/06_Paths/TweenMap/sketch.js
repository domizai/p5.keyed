const duration = 2;
const ground = 300;
const r = 15;

let ball;
let shadowX;
let shadowWidth;
let squash;

function setup() {
    createCanvas(400, 400);
    Keyed.init().setDuration(duration);
    textFont('monospace');
    textSize(14);

    // An arc, then the same arc backwards: a hop there and back.
    const arc = new QuadraticBezier(
        createVector(80, ground - r),
        createVector(200, 0),
        createVector(320, ground - r)
    );
    const hop = arc.add(arc.slice(1, 0));

    ball = Keyed.ofVector()
        .key(0, hop)
        .key(duration, hop);

    // x() turns a path into a Tween<Float> of its x coordinate (y() works too),
    // so the shadow follows the ball along the ground.
    const hopX = hop.x();
    shadowX = Keyed.ofFloat()
        .key(0, hopX)
        .key(duration, hopX);

    // map() turns a tween's values into something else:
    // the higher the ball, the narrower its shadow.
    const hopWidth = hop.map((p) => map(p.y, ground - r, 140, 60, 20));
    shadowWidth = Keyed.ofFloat()
        .key(0, hopWidth)
        .key(duration, hopWidth);

    // A Tween is just a function of d from 0 to 1, so a lambda works too.
    // This one squashes the ball as it lands, at d = 0, 0.5 and 1.
    const landing = (d) => 1 - 0.3 * pow(abs(cos(d * TWO_PI)), 12);
    squash = Keyed.ofFloat()
        .key(0, landing)
        .key(duration, landing);
}

function draw() {
    background(255);

    stroke(220);
    line(40, ground, 360, ground);

    noStroke();
    fill(220);
    ellipse(shadowX.value(), ground, shadowWidth.value(), 8);

    // Squashed flat and wide, with the bottom kept on the path.
    const p = ball.value();
    const s = squash.value();
    fill(0);
    ellipse(p.x, p.y + r * (1 - s), 2 * r * (2 - s), 2 * r * s);

    fill(150);
    text('x()     shadow position', 40, 340);
    text('map()   shadow width', 40, 360);
    text('d -> .. squash on landing', 40, 380);
}
