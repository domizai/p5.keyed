let euler;
let quat;
let overlay;

function setup() {
    createCanvas(400, 400, WEBGL);
    Keyed.init().setDuration(3);

    overlay = createGraphics(400, 400);
    overlay.textFont('monospace');
    overlay.textSize(14);
    overlay.fill(150);
    overlay.noStroke();
    overlay.textAlign(CENTER, CENTER);
    overlay.text('Euler angles', 110, 330);
    overlay.text('Quaternion', 290, 330);

    // Both boxes turn between the same two orientations:
    // no rotation, and rotateX(PI) plus rotateZ(PI).

    // Blending the three angles one by one tumbles along the way.
    euler = Keyed.ofVector()
        .key(Key.at(0).setEasing(1 / 3), createVector(0, 0, 0))
        .key(Key.at(1.5).setEasing(1 / 3), createVector(PI, 0, PI))
        .key(Key.at(3).setEasing(1 / 3), createVector(0, 0, 0));

    // A Quaternion is a 3D rotation that blends along the shortest arc.
    // Here it turns straight around the y axis, which is the same end result.
    quat = Keyed.of(Quaternion.identity())
        .key(Key.at(0).setEasing(1 / 3), Quaternion.identity())
        .key(Key.at(1.5).setEasing(1 / 3), fromEuler(PI, 0, PI))
        .key(Key.at(3).setEasing(1 / 3), Quaternion.identity());
}

// The same rotation as rotateX(x), rotateY(y), rotateZ(z).
function fromEuler(x, y, z) {
    const qx = Quaternion.fromAxisAngle(createVector(1, 0, 0), x);
    const qy = Quaternion.fromAxisAngle(createVector(0, 1, 0), y);
    const qz = Quaternion.fromAxisAngle(createVector(0, 0, 1), z);
    return qx.mult(qy).mult(qz);
}

function draw() {
    background(255);

    push();
    lights();
    translate(-width / 2, -height / 2);

    const e = euler.value();
    push();
    translate(110, 190);
    rotateX(e.x);
    rotateY(e.y);
    rotateZ(e.z);
    drawShape3D();
    pop();

    push();
    translate(290, 190);
    // Rotates the matrix, like rotate(angle, x, y, z).
    quat.value().apply();
    drawShape3D();
    pop();
    pop();

    push();
    resetMatrix();
    translate(-width / 2, -height / 2);
    image(overlay, 0, 0);
    pop();
}

// A box with a red nose, to see which way it faces.
function drawShape3D() {
    noStroke();
    fill(240);
    box(70, 40, 40);
    fill(230, 60, 60);
    translate(45, 0, 0);
    box(20, 20, 20);
}
