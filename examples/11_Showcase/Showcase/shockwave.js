// How long an impact lasts, in seconds.
const SHOCKWAVE_LIFE = 1.4;

// One impact: a ring and a spray of sparks, on a one-shot timeline of its own.
class Shockwave extends Composition {
    constructor(col) {
        super(SHOCKWAVE_LIFE);
        this.col = col;

        const d = SHOCKWAVE_LIFE;

        this.radius = this.add(Keyed.ofFloat()
            .key(Key.at(0).setEasing(Easing.cubicBezier(0.1, 0.9, 0.2, 1)), 10)
            .key(d, 440));

        this.alpha = this.add(Keyed.ofFloat()
            .key(Key.at(0).setEasing(Easing.QUAD_IN), 255)
            .key(d, 0));

        this.weight = this.add(Keyed.ofFloat()
            .key(0, 14)
            .key(d, 1));

        this.spray = this.add(Keyed.ofFloat()
            .key(Key.at(0).setEasing(Easing.QUART_OUT), 0)
            .key(d, 340));

        this.flash = this.add(Keyed.ofFloat()
            .key(Key.at(0).setEasing(Easing.CUBIC_OUT), 1)
            .key(0.4, 0));

        // The warp of the space: its front travels slower than the ring, so the bend stays on screen,
        // and it fades out before the end.
        this.warpRadius = this.add(Keyed.ofFloat()
            .key(Key.at(0).setEasing(Easing.CUBIC_OUT), 0)
            .key(d, 560));

        this.warpStrength = this.add(Keyed.ofFloat()
            .key(Key.at(0).setEasing(Easing.QUAD_OUT), 1)
            .key(d, 0));
    }

    // Drawn in the scene's space, so the ring lies in the shape's plane.
    draw() {
        const a = this.alpha.value();
        noFill();
        stroke(red(this.col), green(this.col), blue(this.col), a);
        strokeWeight(this.weight.value());
        circle(0, 0, this.radius.value() * 2);

        const r = this.spray.value();
        strokeWeight(5);
        for (let i = 0; i < 24; i++) {
            const ang = (i * TWO_PI) / 24;
            const lift = sin(i * 2.4) * r * 0.5;
            const rr = r * (0.6 + 0.4 * abs(sin(i * 1.7)));
            stroke(255, a * 0.8);
            point(cos(ang) * rr, sin(ang) * rr, lift);
        }
    }
}
