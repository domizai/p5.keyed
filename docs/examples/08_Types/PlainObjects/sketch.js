// A lerp is just a function (a, b, d) => value: a at d = 0, b at d = 1.
// This one blends plain objects with x and y, so no class is needed.
const pointLerp = (a, b, d) => ({
    x: (1 - d) * a.x + d * b.x,
    y: (1 - d) * a.y + d * b.y,
});

let point;

function setup() {
    createCanvas(400, 400);
    textFont('monospace');
    textSize(14);

    // The default value is optional: value() is undefined until the first key.
    // Keys can be added in any order.
    point = new Keyed(pointLerp)
        .key(4, { x: 340, y: 100 })
        .key(1, { x: 60, y: 300 });

    // Nothing moves, so draw once.
    noLoop();
}

function draw() {
    background(255);
    noStroke();

    // value(t) reads the animation at any time, here every half second from 1 to 4.
    for (let t = 1; t <= 4; t += 0.5) {
        const p = point.value(t);
        fill(0, 60);
        circle(p.x, p.y, 20);
    }

    // The two keys.
    fill(230, 60, 60);
    for (const key of point.keys()) {
        const p = point.value(key.t());
        circle(p.x, p.y, 12);
    }

    fill(150);
    text('new Keyed(pointLerp).key(...)', 40, 380);
}
