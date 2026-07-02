import type { Signal } from "../types";
import Clause, {
    type ConjunctionOfLiterals
} from "./Clause";
import Vector from "./Vector";

export class RuleOutput {
    position: Vector;
    signal: Signal;

    constructor(position: Vector, signal: Signal) {
        this.position = position;
        this.signal = signal;
    }

    toString(): string {
        const positionStr = this.position.isZero()
            ? ""
            : `${this.position.toString()}.`;

        return `${positionStr}${Symbol.keyFor(this.signal)}`;
    }

    equals(other: RuleOutput): boolean {
        return (
            this.position.equals(other.position) &&
            this.signal === other.signal
        );
    }

    compareTo(other: RuleOutput): number {
        const posComp = this.position.compareTo(other.position);
        if (posComp !== 0) {
            return posComp;
        }
        const s1 = Symbol.keyFor(this.signal) || "";
        const s2 = Symbol.keyFor(other.signal) || "";
        return s1.localeCompare(s2);
    }

    renameSignal(oldSymbol: Signal, newSymbol: Signal): RuleOutput {
        return new RuleOutput(
            this.position,
            this.signal === oldSymbol ? newSymbol : this.signal,
        );
    }
}

/**
 * Representation of a cellular automaton rule.
 * A rule consists of two parts: a condition and a list of signal outputs. Outputs are a list of objects
 * {position: {int}, signal: {int}, futureStep: {int}}
 *
 * When executing the rule on a cell c at time t, the condition is evaluated (it depends on the set of signals
 * on the cell). If it is true, then for each output {position, signal, futureStep}, the signal `signal` is added to
 * the cell (c + `position`) at time (t + `futureStep`) in the space-time diagram.
 *
 * In order to correspond to a cellular automaton, `futureStep` should be either strictly positive or can be 0 if
 * `position` is also 0.
 */
export default class Rule {
    condition: Clause;
    outputs: RuleOutput[];

    constructor(condition: Clause, outputs: RuleOutput[]) {
        this.condition = condition;
        this.outputs = outputs;
    }

    toString() {
        return `${this.condition.toString()}: ${this.outputs
            .map((output) => output.toString())
            .join(" ")}`;
    }

    getSignals(): Set<Signal> {
        const signals = new Set<Signal>();
        for (const literal of this.condition.getLiterals()) {
            signals.add(literal.signal);
        }
        for (const output of this.outputs) {
            signals.add(output.signal);
        }
        return signals;
    }

    replaceSignal(oldSignal: Signal, newSignal: Signal): Rule {
        return new Rule(
            this.condition.renameSignal(oldSignal, newSignal),
            this.outputs.map((output) =>
                output.renameSignal(oldSignal, newSignal),
            ),
        );
    }

    getDimension(): number {
        let dim = 0;
        for (const literal of this.condition.getLiterals()) {
            dim = Math.max(dim, literal.position.dimension());
        }
        for (const output of this.outputs) {
            dim = Math.max(dim, output.position.dimension());
        }
        return dim;
    }

    getMaxPosition(): Vector {
        let max = new Vector();
        for (const literal of this.condition.getLiterals()) {
            max = max.max(literal.position);
        }
        for (const output of this.outputs) {
            max = max.max(output.position);
        }
        return max;
    }

    getMinPosition(): Vector {
        let min = new Vector();
        for (const literal of this.condition.getLiterals()) {
            min = min.min(literal.position);
        }
        for (const output of this.outputs) {
            min = min.min(output.position);
        }
        return min;
    }
}

export type ConjunctionRule = Rule & { condition: ConjunctionOfLiterals };
