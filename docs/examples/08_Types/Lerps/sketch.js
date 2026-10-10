let longWay;
let shortWay;
let rgb;
let hsb;
let morph;
let step;

function setup() {
    createCanvas(400, 400);
    Keyed.init().setDuration(4);
    textFont('monospace');
    textSize(14);
    textAlign(CENTER, CENTER);

    // A Lerp decides how two values blend. Keyed.ofFloat() and friends pick one,
    // new Keyed(lerp, defaultValue) lets you choose.

    // Keyed.ofFloat() uses FloatLerp, which blends the numbers:
    // from 330° to 30° it turns back 300°.
    longWay = Keyed.ofFloat()
        .key(Key.at(0).setEasing(1 / 3), radians(330))
        .key(Key.at(2).setEasing(1 / 3), radians(30))
        .key(Key.at(4).setEasing(1 / 3), radians(330));

    // AngleLerp takes the short way round: 60° forward, across 0°.
    shortWay = new Keyed(new AngleLerp(), 0)
        .key(Key.at(0).setEasing(1 / 3), radians(330))
        .key(Key.at(2).setEasing(1 / 3), radians(30))
        .key(Key.at(4).setEasing(1 / 3), radians(330));

    // Keyed.ofColor() uses ColorLerp, which blends red, green and blue:
    // red to cyan passes through gray.
    const rgbRed = color(255, 0, 0);
    const rgbCyan = color(0, 255, 255);
    rgb = Keyed.ofColor()
        .key(0, rgbRed)
        .key(2, rgbCyan)
        .key(4, rgbRed);

    // Lerp is a function too.
    // This one blends in HSB, passing through the hues instead.
    colorMode(HSB, 360, 100, 100, 1);
    const hsbBlack = color(0, 0, 0);
    const hsbRed = color(0, 100, 100);
    const hsbCyan = color(180, 100, 100);
    colorMode(RGB, 255);
    hsb = new Keyed((a, b, d) => a.lerp(b, d, 'hsb'), hsbBlack)
        .key(0, hsbRed)
        .key(2, hsbCyan)
        .key(4, hsbRed);

    // Keyed.ofString() uses StringLerp, which morphs one character at a time.
    morph = Keyed.ofString()
        .key(0, 'keyed')
        .key(2, 'lerps')
        .key(4, 'keyed');

    // StepLerp doesn't blend: it switches once the blend passes a threshold,
    // here halfway between keys. It works for any type.
    step = new Keyed(new StepLerp(0.5), '')
        .key(0, 'keyed')
        .key(2, 'lerps')
        .key(4, 'keyed');
}

function draw() {
    background(255);

    dial('FloatLerp', 110, 90, longWay.value());
    dial('AngleLerp', 290, 90, shortWay.value());

    noStroke();
    colorMode(RGB, 255);
    fill(rgb.value());
    rect(40, 190, 140, 40);
    colorMode(HSB, 360, 100, 100, 1);
    fill(hsb.value());
    rect(220, 190, 140, 40);
    colorMode(RGB, 255);
    fill(150);
    text('ColorLerp', 110, 250);
    text('lambda, HSB', 290, 250);

    fill(0);
    textSize(24);
    text(morph.value(), 110, 300);
    text(step.value(), 290, 300);
    fill(150);
    textSize(14);
    text('StringLerp', 110, 330);
    text('StepLerp(0.5)', 290, 330);
}

function dial(label, x, y, angle) {
    noFill();
    stroke(220);
    circle(x, y, 100);

    // 0° points up.
    stroke(0);
    strokeWeight(3);
    line(x, y, x + sin(angle) * 40, y - cos(angle) * 40);
    strokeWeight(1);

    noStroke();
    fill(150);
    const deg = ((degrees(angle) % 360) + 360) % 360;
    text(`${label}  ${round(deg)}°`, x, y + 70);
}
