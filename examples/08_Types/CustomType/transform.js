/** Immutable position, rotation and scale, so lerp() can safely share instances. */
class Transform {
    /** Rotation in radians. */
    constructor(x, y, rotation = 0, scale = 1) {
        this.x = x;
        this.y = y;
        this.rotation = rotation;
        this.scale = scale;
    }

    /** Rotation takes the shorter way round, e.g. 350° to 10° turns 20°, not 340°. */
    lerp(b, d) {
        const turn = ((((b.rotation - this.rotation) % TWO_PI) + TWO_PI + PI) % TWO_PI) - PI;
        return new Transform(
            lerp(this.x, b.x, d),
            lerp(this.y, b.y, d),
            this.rotation + turn * d,
            lerp(this.scale, b.scale, d),
        );
    }

    /** Translates, rotates and scales g; call inside push()/pop(), e.g. transform.value().apply(). */
    apply(g = window) {
        g.translate(this.x, this.y);
        g.rotate(this.rotation);
        g.scale(this.scale);
    }
}
