import type { Signal } from "../types";
import Clause, {
    Conjunction,
    type ConjunctionOfLiterals,
    Disjunction,
    EvalContext,
    Negation,
} from "./Clause";
import RuleGrid from "./RuleGrid";
import Vector from "./Vector";

export class RuleOutput {
    position: Vector;
    signal: Signal;
    futureStep: number;

    constructor(position: Vector, signal: Signal, futureStep = 1) {
        this.position = position;
        this.signal = signal;
        this.futureStep = futureStep;
    }

    toString(): string {
        const positionStr = this.position.isZero()
            ? ""
            : `${this.position.toString()}`;
        const futureStepStr =
            this.futureStep === 1 ? "" : `/${this.futureStep}`;
        const dotStr = positionStr !== "" || futureStepStr !== "" ? "." : "";

        return `${positionStr}${futureStepStr}${dotStr}${Symbol.keyFor(
            this.signal
        )}`;
    }

    equals(other: RuleOutput): boolean {
        return (
            this.position.equals(other.position) &&
            this.signal === other.signal &&
            this.futureStep === other.futureStep
        );
    }

    compareTo(other: RuleOutput): number {
        if (this.futureStep !== other.futureStep) {
            return this.futureStep - other.futureStep;
        }
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
            this.futureStep
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
                output.renameSignal(oldSignal, newSignal)
            )
        );
    }

    // TODO check that fitting still works (and check 2D case)
    fitTarget(targetGrid: RuleGrid, context: EvalContext): Rule[] {
        const targetRule = targetGrid.makeRule();
        const minPosition = targetRule.condition.getMinPosition();
        const maxPosition = targetRule.condition.getMaxPosition();

        const validOutputs = new Set(this.outputs);
        const invalidOutputs = new Map<RuleOutput, Vector[]>();

        for (const c of targetGrid.inputCells.iterWithNeighborhood(
            minPosition,
            maxPosition
        )) {
            if (this.condition.eval(targetGrid.inputCells, c, context)) {
                for (const output of this.outputs) {
                    if (
                        0 < output.futureStep &&
                        output.futureStep <= targetGrid.outputCells.length
                    ) {
                        const cell = targetGrid.outputCells[
                            output.futureStep - 1
                        ].getCellAt(Vector.add(c, output.position));
                        if (cell && !cell.has(output.signal)) {
                            // this output should be removed when in the exact conditions of the input
                            validOutputs.delete(output);
                            if (!invalidOutputs.has(output)) {
                                invalidOutputs.set(output, []);
                            }
                            invalidOutputs.get(output)!.push(c);
                        }
                    }
                }
            }
        }
        if (validOutputs.size === this.outputs.length) {
            // no need to change the rule
            return [this];
        } else {
            const resultingRules = [];
            if (validOutputs.size > 0) {
                resultingRules.push(
                    new Rule(this.condition, Array.from(validOutputs))
                );
            }
            const gridInputsConjunction = targetGrid.makeRuleCondition(false);
            for (const [output, positions] of invalidOutputs) {
                resultingRules.push(
                    new Rule(
                        new Conjunction([
                            this.condition,
                            new Negation(
                                new Disjunction(
                                    positions.map((p) =>
                                        gridInputsConjunction.shifted(
                                            p.negated()
                                        )
                                    )
                                )
                            ),
                        ]).simplified(),
                        [output]
                    )
                );
            }
            return resultingRules;
        }
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
}

export type ConjunctionRule = Rule & { condition: ConjunctionOfLiterals };
