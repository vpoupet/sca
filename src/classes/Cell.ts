import { setsEqual } from "@/lib/utils";
import { type Signal } from "../types";

export default class Cell {
    signals: Set<Signal>;
    negatedSignals: Set<Signal> = new Set();

    constructor(
        signals: Set<Signal> = new Set(),
        negatedSignals: Set<Signal> = new Set()
    ) {
        this.signals = new Set(signals);
        this.negatedSignals = new Set(negatedSignals);
    }

    has(signal: Signal): boolean {
        return this.signals.has(signal);
    }

    clone(): Cell {
        return new Cell(new Set(this.signals), new Set(this.negatedSignals));
    }

    addSignal(signal: Signal) {
        this.negatedSignals.delete(signal);
        this.signals.add(signal);
    }
    
    addNegatedSignal(signal: Signal) {
        this.signals.delete(signal);
        this.negatedSignals.add(signal);
    }

    removeSignal(signal: Signal): boolean {
        return this.signals.delete(signal);
    }

    removeNegatedSignal(signal: Signal): boolean {
        return this.negatedSignals.delete(signal);
    }

    removeAllSignals(): void {
        this.signals.clear();
        this.negatedSignals.clear();
    }

    equals(cell: Cell): boolean {
        return setsEqual(this.signals, cell.signals) &&
               setsEqual(this.negatedSignals, cell.negatedSignals);
    }

    isInput(): boolean {
        return false;
    }
}
