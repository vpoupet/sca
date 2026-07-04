import grammar from "@/grammar/grammar";
import type { ParsedLine } from "@/grammar/types";
import nearley from "nearley";
import type { MultiSignals, Signal } from "../types";
import Clause, {
    Conjunction,
    Literal,
    type ConjunctionOfLiterals,
} from "./Clause";
import { transformations } from "./transformations/Transformation";
import Vector from "./Vector";

export class RuleOutput {
    signal: Signal;
    position: Vector;
    timeStep: number;

    constructor(signal: Signal, position: Vector, timeStep: number = 1) {
        this.signal = signal;
        this.position = position;
        this.timeStep = timeStep;
    }

    toString(): string {
        const positionStr = this.position.isZero()
            ? ""
            : `${this.position.toString()}`;
        const timeStepStr = this.timeStep === 1 ? "" : `/${this.timeStep}`;
        const dotStr = positionStr !== "" || timeStepStr !== "" ? "." : "";

        return `${positionStr}${timeStepStr}${dotStr}${Symbol.keyFor(this.signal)}`;
    }

    equals(other: RuleOutput): boolean {
        return (
            this.position.equals(other.position) &&
            this.timeStep === other.timeStep &&
            this.signal === other.signal
        );
    }

    compareTo(other: RuleOutput): number {
        const timeComp = this.timeStep - other.timeStep;
        if (timeComp !== 0) {
            return timeComp;
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
            this.signal === oldSymbol ? newSymbol : this.signal,
            this.position,
            this.timeStep,
        );
    }
}

export class RewriteRuleOutput extends RuleOutput {
    declare timeStep: 0;

    constructor(signal: Signal, position: Vector) {
        super(signal, position, 0);
    }

    override renameSignal(
        oldSymbol: Signal,
        newSymbol: Signal,
    ): RewriteRuleOutput {
        return new RewriteRuleOutput(
            this.signal === oldSymbol ? newSymbol : this.signal,
            this.position,
        );
    }
}

export class NextStepRuleOutput extends RuleOutput {
    declare timeStep: 1;

    constructor(signal: Signal, position: Vector) {
        super(signal, position, 1);
    }

    override renameSignal(
        oldSymbol: Signal,
        newSymbol: Signal,
    ): NextStepRuleOutput {
        return new NextStepRuleOutput(
            this.signal === oldSymbol ? newSymbol : this.signal,
            this.position,
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

    asRuleSet(): Ruleset {
        const rewriteOutputs: RewriteRuleOutput[] = [];
        const nextStepOutputs: NextStepRuleOutput[] = [];
        const rewriteRules: RewriteRule[] = [];
        const nextStepRules: NextStepRule[] = [];

        function auxSignal(
            signal: Signal,
            position: Vector,
            timeStep: number,
        ): Signal {
            if (timeStep === 0) {
                return signal;
            }
            return Symbol.for(
                `$${position.toString()}/${timeStep}→${signal.description}`,
            );
        }

        for (const o of this.outputs) {
            if (o.timeStep === 0) {
                rewriteOutputs.push(
                    new RewriteRuleOutput(o.signal, o.position),
                );
            } else if (o.timeStep === 1) {
                nextStepOutputs.push(
                    new NextStepRuleOutput(o.signal, o.position),
                );
            } else if (o.timeStep > 1) {
                const s = o.signal;
                let t = o.timeStep;
                let v = o.position;
                let dv: Vector;

                // first step
                dv = Vector.divInt(v, t);
                v = v.subtract(dv);
                t -= 1;
                nextStepOutputs.push(
                    new NextStepRuleOutput(auxSignal(s, v, t), dv),
                );

                // other steps
                while (t > 0) {
                    const s1 = auxSignal(s, v, t);
                    dv = Vector.divInt(v, t);
                    v = v.subtract(dv);
                    t -= 1;
                    const s2 = auxSignal(s, v, t);
                    nextStepRules.push(
                        new NextStepRule(new Literal(s1, new Vector()), [
                            new NextStepRuleOutput(s2, dv),
                        ]),
                    );
                }
            }
        }

        if (rewriteOutputs.length > 0) {
            rewriteRules.push(new RewriteRule(this.condition, rewriteOutputs));
        }
        if (nextStepOutputs.length > 0) {
            nextStepRules.unshift(
                new NextStepRule(this.condition, nextStepOutputs),
            );
        }
        return {
            rewrite: rewriteRules,
            nextStep: nextStepRules,
        };
    }

    static makeRuleset(rules: Rule[]): Ruleset {
        const rewriteRules: RewriteRule[] = [];
        const nextStepRules: NextStepRule[] = [];
        for (const rule of rules) {
            const ruleset = rule.asRuleSet();
            rewriteRules.push(...ruleset.rewrite);
            nextStepRules.push(...ruleset.nextStep);
        }
        return {
            rewrite: rewriteRules,
            nextStep: nextStepRules,
        };
    }

    static parseRulesFromString(inputString: string): {
        rules: Rule[];
        multiSignals: MultiSignals;
    } {
        const parser = new nearley.Parser(
            nearley.Grammar.fromCompiled(grammar),
        );
        try {
            parser.feed(inputString);
            if (parser.results.length !== 1) {
                throw new Error("Ambiguous grammar!");
            }
        } catch (e) {
            console.log(e);
        }
        const outputLines = parser.results[0] as ParsedLine[];
        const functionsStack: {
            name: string | undefined;
            parameters: string[];
            rules: Rule[];
            multiSignals: MultiSignals;
        }[] = [
            {
                name: undefined,
                parameters: [],
                rules: [],
                multiSignals: new Map(),
            },
        ];
        let rules = functionsStack[0].rules;
        let multiSignals = functionsStack[0].multiSignals;

        const conditionsStack: { condition: Clause; indent: number }[] = [];
        for (const line of outputLines) {
            if (line.type !== "empty_line") {
                // remove irrelevant conditions from stack
                while (
                    conditionsStack.length > 0 &&
                    conditionsStack[0].indent >= line.indent
                ) {
                    conditionsStack.shift();
                }
            }
            switch (line.type) {
                case "rule_line": {
                    let condition: Clause;
                    if (line.condition !== undefined) {
                        if (conditionsStack.length === 0) {
                            condition = line.condition;
                        } else {
                            condition = new Conjunction([
                                conditionsStack[0].condition,
                                line.condition,
                            ]);
                        }
                        conditionsStack.unshift({
                            condition,
                            indent: line.indent,
                        });
                    } else {
                        condition = conditionsStack[0].condition;
                    }
                    if (line.outputs !== undefined) {
                        rules.push(new Rule(condition, line.outputs));
                    }
                    break;
                }
                case "begin_function": {
                    functionsStack.unshift({
                        name: line.function_name,
                        parameters: line.parameters,
                        rules: [],
                        multiSignals: new Map(),
                    });
                    rules = functionsStack[0].rules;
                    break;
                }
                case "end_function": {
                    const functionData = functionsStack.shift(); // pop stack frame
                    if (
                        functionData === undefined ||
                        functionData.name === undefined
                    ) {
                        throw new Error("Not currently in a function");
                    }
                    const transformation = transformations.get(
                        functionData.name,
                    );
                    if (transformation === undefined) {
                        throw new Error(
                            `Unknown transformation: ${functionData.name}`,
                        );
                    }

                    // Apply function to previous stack rules
                    const newRules = transformation.transformRules(
                        rules,
                        functionData.parameters,
                    );
                    // Append new rules to new stack frame
                    rules = [...functionsStack[0].rules, ...newRules];

                    // Apply function to previous stack multiSignals
                    const newMultiSignals =
                        transformation.transformMultiSignals(
                            multiSignals,
                            functionData.parameters,
                        );
                    // Append new multiSignals to new stack frame
                    multiSignals = new Map([
                        ...functionsStack[0].multiSignals,
                        ...newMultiSignals,
                    ]);
                    break;
                }
                case "multi_signal": {
                    multiSignals.set(line.signal, new Set(line.values));
                    break;
                }
                case "empty_line":
                    break;
            }
        }
        if (functionsStack.length > 1) {
            throw new Error("Function not closed");
        }

        return {
            rules,
            multiSignals,
        };
    }
}

export class RewriteRule extends Rule {
    declare outputs: RewriteRuleOutput[];

    constructor(condition: Clause, outputs: RewriteRuleOutput[]) {
        super(condition, outputs);
    }

    replaceSignal(oldSignal: Signal, newSignal: Signal): RewriteRule {
        return new RewriteRule(
            this.condition.renameSignal(oldSignal, newSignal),
            this.outputs.map((output) =>
                output.renameSignal(oldSignal, newSignal),
            ),
        );
    }
}

export class NextStepRule extends Rule {
    declare outputs: NextStepRuleOutput[];

    constructor(condition: Clause, outputs: NextStepRuleOutput[]) {
        super(condition, outputs);
    }

    replaceSignal(oldSignal: Signal, newSignal: Signal): NextStepRule {
        return new NextStepRule(
            this.condition.renameSignal(oldSignal, newSignal),
            this.outputs.map((output) =>
                output.renameSignal(oldSignal, newSignal),
            ),
        );
    }
}

export type Ruleset = {
    rewrite: RewriteRule[];
    nextStep: NextStepRule[];
};

export type ConjunctionRule = Rule & { condition: ConjunctionOfLiterals };
