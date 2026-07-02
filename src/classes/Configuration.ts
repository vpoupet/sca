import z from "zod";
import { configurationFileSchema, type Signal } from "../types.ts";
import Cell from "./Cell.ts";
import Vector from "./Vector.ts";

export abstract class Configuration {
    id: string;

    constructor() {
        this.id = crypto.randomUUID();
    }

    abstract clone(): this;

    abstract getSize(): Vector;

    abstract getCellAt(c: Vector): Cell | null;

    abstract setCellAt(c: Vector, cell: Cell): void;

    getSignalsAt(c: Vector): Set<Signal> {
        const cell = this.getCellAt(c);
        if (cell === null) {
            return new Set<Signal>();
        }
        return cell.signals;
    }

    getSignals(): Set<Signal> {
        const signals = new Set<Signal>();
        for (const c of this.iterPositions()) {
            const cell = this.getCellAt(c);
            cell?.signals.forEach((s) => signals.add(s));
        }
        return signals;
    }

    addSignalAt(c: Vector, signal: Signal): void {
        const cell = this.getCellAt(c);
        if (cell !== null) {
            cell.addSignal(signal);
        }
    }

    abstract getDimension(): number;

    abstract iterPositions(): Iterable<Vector>;

    abstract iterPositionsWithNeighborhood(
        minPosition: Vector,
        maxPosition: Vector,
    ): Iterable<Vector>;

    abstract iterCells(): Iterable<Cell>;

    static withSize(dimensions: Vector): Configuration {
        if (dimensions.intrinsicDimension() === 1) {
            return Configuration1D.withSize(dimensions);
        } else if (dimensions.intrinsicDimension() === 2) {
            // if dimensions has at least 2 coords, use first two to create 2D configuration
            return Configuration2D.withSize(dimensions);
        }
        throw new Error(`Unsupported dimensions: ${dimensions}`);
    }

    static fromJSON(
        data: z.infer<typeof configurationFileSchema>,
    ): Configuration {
        const config = Configuration.withSize(new Vector(data.size));
        for (const [key, signalNames] of Object.entries(data.signals)) {
            const coords = key.split(",").map((s) => parseInt(s, 10));
            const cell = config.getCellAt(new Vector(coords));
            if (cell === null) {
                continue;
            }
            for (const signalName of signalNames) {
                cell.addSignal(Symbol.for(signalName));
            }
        }
        return config;
    }

    equals(other: Configuration): boolean {
        if (!this.getSize().equals(other.getSize())) {
            return false;
        }
        for (const c of this.iterPositions()) {
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

export class Configuration1D extends Configuration {
    cells: Cell[];

    constructor(cells: Cell[]) {
        super();
        this.cells = cells;
    }

    static withSize(dimensions: Vector): Configuration1D {
        return new Configuration1D(
            Array(dimensions.at(0))
                .fill(0)
                .map(() => new Cell()),
        );
    }

    clone(): this {
        return new (this.constructor as new (cells: Cell[]) => this)(
            this.cells.map((cell) => cell.clone()),
        );
    }

    getSize(): Vector {
        return new Vector([this.cells.length]);
    }

    getCellAt(c: Vector): Cell | null {
        const index = c.at(0);
        if (index < 0 || index >= this.cells.length) {
            return null;
        }
        return this.cells[index];
    }

    setCellAt(c: Vector, cell: Cell): void {
        const index = c.coords[0];
        if (index >= 0 && index < this.cells.length) {
            this.cells[index] = cell;
        }
    }

    getDimension(): number {
        return 1;
    }

    *iterPositions(): Generator<Vector> {
        for (let i = 0; i < this.cells.length; ++i) {
            yield new Vector([i]);
        }
    }

    *iterPositionsWithNeighborhood(
        minPosition: Vector,
        maxPosition: Vector,
    ): Generator<Vector> {
        for (
            let i = -maxPosition.at(0);
            i < this.cells.length - minPosition.at(0);
            ++i
        ) {
            yield new Vector([i]);
        }
    }

    *iterCells(): Generator<Cell> {
        for (const cell of this.cells) {
            yield cell;
        }
    }
}

export class Configuration2D extends Configuration {
    cells: Cell[];
    width: number;
    height: number;

    constructor(cells: Cell[], width: number, height: number) {
        super();
        this.cells = cells;
        this.width = width;
        this.height = height;
    }

    static withSize(dimensions: Vector): Configuration2D {
        return new Configuration2D(
            Array(dimensions.at(0) * dimensions.at(1))
                .fill(0)
                .map(() => new Cell()),
            dimensions.at(0),
            dimensions.at(1),
        );
    }

    clone(): this {
        return new (this.constructor as new (
            cells: Cell[],
            width: number,
            height: number,
        ) => this)(
            this.cells.map((cell) => cell.clone()),
            this.width,
            this.height,
        );
    }

    getSize(): Vector {
        return new Vector([this.width, this.height]);
    }

    getCellAt(c: Vector): Cell | null {
        const x = c.at(0);
        const y = c.at(1);
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return null;
        }
        const index = y * this.width + x;
        return this.cells[index];
    }

    setCellAt(c: Vector, cell: Cell): void {
        const [x, y] = c.coords;
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return;
        }
        const index = y * this.width + x;
        this.cells[index] = cell;
    }

    getDimension(): number {
        return 2;
    }

    *iterPositions(): Generator<Vector> {
        for (let y = 0; y < this.height; ++y) {
            for (let x = 0; x < this.width; ++x) {
                yield new Vector([x, y]);
            }
        }
    }

    *iterPositionsWithNeighborhood(
        minPosition: Vector,
        maxPosition: Vector,
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

    *iterCells(): Generator<Cell> {
        for (const cell of this.cells) {
            yield cell;
        }
    }
}
