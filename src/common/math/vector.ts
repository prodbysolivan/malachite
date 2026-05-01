export class Vector<T extends number> {
    public x: T;
    public y: T;
    public z: T;

    constructor(x: T, y: T, z: T) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public add(vector: Vector<T>): Vector<number> {
        return new Vector(this.x + vector.x, this.y + vector.y, this.z + vector.z);
    }

    public subtract(vector: Vector<T>): Vector<number> {
        return new Vector(this.x - vector.x, this.y - vector.y, this.z - vector.z);
    }

    public multiply(scalar: number): Vector<number> {
        return new Vector(this.x * scalar, this.y * scalar, this.z * scalar);
    }

    public divide(scalar: number): Vector<number> {
        if (scalar !== 0) {
            return new Vector(this.x / scalar, this.y / scalar, this.z / scalar);
        }
        return new Vector(0, 0, 0);
    }

    public dotProduct(vector: Vector<T>): number {
        return this.x * vector.x + this.y * vector.y + this.z * vector.z;
    }

    public magnitudeSquared(): number {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    public magnitude(): number {
        return Math.sqrt(this.magnitudeSquared());
    }

    public normalize(): Vector<number> {
        const magnitude = this.magnitude();
        if (magnitude > 0) {
            return this.divide(magnitude);
        }
        return new Vector(0, 0, 0);
    }
}
