export default class Vector {
    coords: number[];

    constructor(coords: number[] = []) {
        this.coords = coords;
    }

    clone(): Vector {
        return new Vector([...this.coords]);
    }

    isZero(): boolean {
        return this.coords.every((coord) => coord === 0);
    }

    /**
     *
     * @returns the number of coordinates of the `Vector`
     */
    dimension(): number {
        return this.coords.length;
    }

    /**
     * @returns the position of the last non-zero coordinate of the `Vector`
     * plus one. Returns 0 if the vector is the zero vector.
     */
    intrinsicDimension(): number {
        for (let i = this.coords.length - 1; i >= 0; i--) {
            if (this.coords[i] !== 0) {
                return i + 1;
            }
        }
        return 0;
    }

    at(index: number): number {
        return this.coords[index] || 0;
    }

    equals(other: Vector): boolean {
        for (
            let i = 0;
            i < Math.max(this.coords.length, other.coords.length);
            i++
        ) {
            if ((this.coords[i] || 0) !== (other.coords[i] || 0)) {
                return false;
            }
        }
        return true;
    }

    compareTo(other: Vector): number {
        for (
            let i = 0;
            i < Math.max(this.coords.length, other.coords.length);
            i++
        ) {
            if ((this.coords[i] || 0) !== (other.coords[i] || 0)) {
                return (this.coords[i] || 0) - (other.coords[i] || 0);
            }
        }
        return 0;
    }

    add(other: Vector): Vector {
        return new Vector(
            new Array(Math.max(this.coords.length, other.coords.length))
                .fill(0)
                .map((_, i) => (this.coords[i] || 0) + (other.coords[i] || 0)),
        );
    }

    static add(v1: Vector, v2: Vector): Vector {
        return new Vector(
            new Array(Math.max(v1.coords.length, v2.coords.length))
                .fill(0)
                .map((_, i) => (v1.coords[i] || 0) + (v2.coords[i] || 0)),
        );
    }

    subtract(other: Vector): Vector {
        return new Vector(
            new Array(Math.max(this.coords.length, other.coords.length))
                .fill(0)
                .map((_, i) => (this.coords[i] || 0) - (other.coords[i] || 0)),
        );
    }

    static subtract(v1: Vector, v2: Vector): Vector {
        return new Vector(
            new Array(Math.max(v1.coords.length, v2.coords.length))
                .fill(0)
                .map((_, i) => (v1.coords[i] || 0) - (v2.coords[i] || 0)),
        );
    }

    mult(scalar: number): Vector {
        return new Vector(this.coords.map((coord) => coord * scalar));
    }

    static mult(v: Vector, scalar: number): Vector {
        return new Vector(v.coords.map((coord) => coord * scalar));
    }

    negated(): Vector {
        return new Vector(this.coords.map((coord) => -coord));
    }

    max(other: Vector): Vector {
        const resultingCoords: number[] = [];
        for (
            let i = 0;
            i < Math.max(this.coords.length, other.coords.length);
            i++
        ) {
            resultingCoords.push(
                Math.max(this.coords[i] || 0, other.coords[i] || 0),
            );
        }
        return new Vector(resultingCoords);
    }

    static max(v1: Vector, v2: Vector): Vector {
        const resultingCoords: number[] = [];
        for (let i = 0; i < Math.max(v1.coords.length, v2.coords.length); i++) {
            resultingCoords.push(
                Math.max(v1.coords[i] || 0, v2.coords[i] || 0),
            );
        }
        return new Vector(resultingCoords);
    }

    min(other: Vector): Vector {
        const resultingCoords: number[] = [];
        for (
            let i = 0;
            i < Math.max(this.coords.length, other.coords.length);
            i++
        ) {
            resultingCoords.push(
                Math.min(this.coords[i] || 0, other.coords[i] || 0),
            );
        }
        return new Vector(resultingCoords);
    }

    static min(v1: Vector, v2: Vector): Vector {
        const resultingCoords: number[] = [];
        for (let i = 0; i < Math.max(v1.coords.length, v2.coords.length); i++) {
            resultingCoords.push(
                Math.min(v1.coords[i] || 0, v2.coords[i] || 0),
            );
        }
        return new Vector(resultingCoords);
    }

    static zero(dimension: number): Vector {
        return new Vector(Array.from({ length: dimension }, () => 0));
    }

    static one(dimension: number): Vector {
        return new Vector(Array.from({ length: dimension }, () => 1));
    }

    toString(): string {
        return this.coords.join(", ");
    }
}
