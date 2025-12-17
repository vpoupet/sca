import { type Signal } from "../types.ts";
import Cell from "./Cell.ts";
import Vector from "./Vector.ts";

export abstract class Configuration<TCell extends Cell> {
    abstract clone(): this;

    abstract getSize(): Vector;

    abstract getCellAt(c: Vector): TCell | null;

    abstract setCellAt(c: Vector, cell: TCell): void;

    getSignalsAt(c: Vector): Set<Signal> {
        const cell = this.getCellAt(c);
        if (cell === null) {
            return new Set<Signal>();
        }
        return cell.signals;
    }

    addSignalAt(c: Vector, signal: Signal): void {
        const cell = this.getCellAt(c);
        if (cell !== null) {
            cell.addSignal(signal);
        }
    }

    abstract iter(): Iterable<Vector>;

    abstract iterWithNeighborhood(
        minPosition: Vector,
        maxPosition: Vector
    ): Iterable<Vector>;

    static withSize(dimensions: Vector): Configuration<Cell> {
        if (dimensions.coords.length === 1) {
            return Configuration1D.withSize(dimensions);
        } else {
            // if dimensions has at least 2 coords, use first two to create 2D configuration
            return Configuration2D.withSize(dimensions);
        }
    }

    equals(other: Configuration<TCell>): boolean {
        if (!this.getSize().equals(other.getSize())) {
            return false;
        }
        for (const c of this.iter()) {
            const thisCell = this.getCellAt(c);
            const otherCell = other.getCellAt(c);
            if (thisCell === null || otherCell === null) {
                if (thisCell !== otherCell) {
                    return false;
                }
            } else if (!thisCell.equals(otherCell)) {
                return false;
            }
        }
        return true;
    }
}

export class Configuration1D<TCell extends Cell> extends Configuration<TCell> {
    cells: TCell[];

    constructor(cells: TCell[]) {
        super();
        this.cells = cells;
    }

    static withSize(dimensions: Vector): Configuration1D<Cell> {
        return new Configuration1D(
            Array(dimensions.at(0))
                .fill(0)
                .map(() => new Cell())
        );
    }

    clone(): this {
        return new (this.constructor as new (cells: TCell[]) => this)(
            this.cells.map((cell) => cell.clone())
        );
    }

    getSize(): Vector {
        return new Vector([this.cells.length]);
    }

    getCellAt(c: Vector): TCell | null {
        const index = c.coords[0];
        if (index < 0 || index >= this.cells.length) {
            return null;
        }
        return this.cells[index];
    }

    setCellAt(c: Vector, cell: TCell): void {
        const index = c.coords[0];
        if (index >= 0 && index < this.cells.length) {
            this.cells[index] = cell;
        }
    }

    *iter(): Generator<Vector> {
        for (let i = 0; i < this.cells.length; ++i) {
            yield new Vector([i]);
        }
    }

    *iterWithNeighborhood(
        minPosition: Vector,
        maxPosition: Vector
    ): Generator<Vector> {
        for (
            let i = -maxPosition.at(0);
            i < this.cells.length - minPosition.at(0);
            ++i
        ) {
            yield new Vector([i]);
        }
    }
}

export class Configuration2D<TCell extends Cell> extends Configuration<TCell> {
    cells: TCell[];
    width: number;
    height: number;

    constructor(cells: TCell[], width: number, height: number) {
        super();
        this.cells = cells;
        this.width = width;
        this.height = height;
    }

    static withSize(dimensions: Vector): Configuration2D<Cell> {
        return new Configuration2D(
            Array(dimensions.at(0) * dimensions.at(1))
                .fill(0)
                .map(() => new Cell()),
            dimensions.at(0),
            dimensions.at(1)
        );
    }

    clone(): this {
        return new (this.constructor as new (cells: TCell[], width: number, height: number) => this)(
            this.cells.map((cell) => cell.clone()),
            this.width,
            this.height
        );
    }

    getSize(): Vector {
        return new Vector([this.width, this.height]);
    }

    getCellAt(c: Vector): TCell | null {
        const [x, y] = c.coords;
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return null;
        }
        const index = y * this.width + x;
        return this.cells[index];
    }

    setCellAt(c: Vector, cell: TCell): void {
        const [x, y] = c.coords;
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return;
        }
        const index = y * this.width + x;
        this.cells[index] = cell;
    }

    *iter(): Generator<Vector> {
        for (let y = 0; y < this.height; ++y) {
            for (let x = 0; x < this.width; ++x) {
                yield new Vector([x, y]);
            }
        }
    }

    *iterWithNeighborhood(
        minPosition: Vector,
        maxPosition: Vector
    ): Generator<Vector> {
        const minPosX = minPosition.at(0);
        const minPosY = minPosition.at(1);
        const maxPosX = maxPosition.at(0);
        const maxPosY = maxPosition.at(1);
        for (let y = -maxPosY; y < this.height - minPosY; ++y) {
            for (let x = -maxPosX; x < this.width - minPosX; ++x) {
                yield new Vector([x, y]);
            }
        }
    }
}
