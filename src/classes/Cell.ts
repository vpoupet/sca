import { type Signal } from "../types";

export default class Cell {
    signals: Set<Signal>;

    constructor(signals: Set<Signal> = new Set()) {
        this.signals = new Set(signals);
    }

    has(signal: Signal): boolean {
        return this.signals.has(signal);
    }

    clone(): this {
        // Specific syntax to ensure correct typing when cloning subclasses
        return new (this.constructor as new (signals: Set<Signal>) => this)(
            this.signals
        );
    }

    addSignal(signal: Signal) {
        this.signals.add(signal);
    }

    removeSignal(signal: Signal): boolean {
        return this.signals.delete(signal);
    }

    removeAllSignals() {
        this.signals.clear();
    }

    equals(cell: Cell): boolean {
        return cell.signals === this.signals;
    }

    isInput(): boolean {
        return false;
    }

    addNegatedSignal(signal: Signal): void {
        this.signals.delete(signal);
    }

    removeNegatedSignal(_signal: Signal): boolean {
        return false;
    }
}

export class InputCell extends Cell {
    negatedSignals: Set<Signal>;

    constructor(
        signals: Set<Signal> = new Set(),
        negatedSignals: Set<Signal> = new Set()
    ) {
        super(signals);
        this.negatedSignals = new Set(negatedSignals);
    }

    addSignal(signal: Signal) {
        this.negatedSignals.delete(signal);
        super.addSignal(signal);
    }

    addNegatedSignal(signal: Signal) {
        this.signals.delete(signal);
        this.negatedSignals.add(signal);
    }

    removeNegatedSignal(signal: Signal): boolean {
        return this.negatedSignals.delete(signal);
    }

    removeAllSignals(): void {
        super.removeAllSignals();
        this.negatedSignals.clear();
    }

    equals(other: Cell): boolean {
        if (!(other instanceof InputCell)) {
            return false;
        }
        if (!super.equals(other)) {
            return false;
        }
        if (this.negatedSignals.size !== other.negatedSignals.size) {
            return false;
        }
        for (const signal of this.negatedSignals) {
            if (!other.negatedSignals.has(signal)) {
                return false;
            }
        }
        return true;
    }

    isInput(): boolean {
        return true;
    }

    clone(): this {
        return new (this.constructor as new (
            signals: Set<Signal>,
            negatedSignals: Set<Signal>
        ) => this)(this.signals, this.negatedSignals);
    }
}
