class VectorError extends Error {}

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
        const resultingCoords: number[] = [];
        for (
            let i = 0;
            i < Math.max(this.coords.length, other.coords.length);
            i++
        ) {
            resultingCoords.push(
                (this.coords[i] || 0) + (other.coords[i] || 0)
            );
        }
        return new Vector(resultingCoords);
    }

    static add(v1: Vector, v2: Vector): Vector {
        const resultingCoords: number[] = [];
        for (let i = 0; i < Math.max(v1.coords.length, v2.coords.length); i++) {
            resultingCoords.push((v1.coords[i] || 0) + (v2.coords[i] || 0));
        }
        return new Vector(resultingCoords);
    }

    subtract(other: Vector): Vector {
        if (this.coords.length !== other.coords.length) {
            throw new VectorError(
                "Cannot subtract vectors of different dimensions"
            );
        }

        const resultingCoords: number[] = [];
        for (let i = 0; i < this.coords.length; i++) {
            resultingCoords.push(this.coords[i] - other.coords[i]);
        }
        return new Vector(resultingCoords);
    }

    static subtract(v1: Vector, v2: Vector): Vector {
        if (v1.coords.length !== v2.coords.length) {
            throw new VectorError(
                "Cannot subtract vectors of different dimensions"
            );
        }

        const resultingCoords: number[] = [];
        for (let i = 0; i < v1.coords.length; i++) {
            resultingCoords.push(v1.coords[i] - v2.coords[i]);
        }
        return new Vector(resultingCoords);
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
                Math.max(this.coords[i] || 0, other.coords[i] || 0)
            );
        }
        return new Vector(resultingCoords);
    }

    static max(v1: Vector, v2: Vector): Vector {
        const resultingCoords: number[] = [];
        for (let i = 0; i < Math.max(v1.coords.length, v2.coords.length); i++) {
            resultingCoords.push(
                Math.max(v1.coords[i] || 0, v2.coords[i] || 0)
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
                Math.min(this.coords[i] || 0, other.coords[i] || 0)
            );
        }
        return new Vector(resultingCoords);
    }

    static min(v1: Vector, v2: Vector): Vector {
        const resultingCoords: number[] = [];
        for (let i = 0; i < Math.max(v1.coords.length, v2.coords.length); i++) {
            resultingCoords.push(
                Math.min(v1.coords[i] || 0, v2.coords[i] || 0)
            );
        }
        return new Vector(resultingCoords);
    }

    toString(): string {
        return this.coords.join(", ");
    }
}
