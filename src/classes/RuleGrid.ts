import Clause, { Conjunction, Literal } from "./Clause.ts";
import { Configuration } from "./Configuration.ts";
import Rule, { RuleOutput, type ConjunctionRule } from "./Rule.ts";
import Vector from "./Vector.ts";

class RuleGrid {
    inputCells: Configuration;
    outputCells: Configuration;
    shift: Vector;

    constructor(
        inputCells: Configuration,
        outputCells: Configuration,
        shift: Vector,
    ) {
        this.inputCells = inputCells;
        this.outputCells = outputCells;
        this.shift = shift;
    }

    static withBounds(min: Vector, max: Vector, dimension: number): RuleGrid {
        const size = Vector.subtract(max, min).add(Vector.one(dimension));
        const inputs = Configuration.withSize(size);
        const outputs = Configuration.withSize(size);
        return new RuleGrid(inputs, outputs, min);
    }

    static fromRule(rule: ConjunctionRule, dimension: number, radius: number): RuleGrid {
        const v = Vector.one(dimension).mult(radius);
        const min = rule.getMinPosition().min(v.negated());
        const max = rule.getMaxPosition().max(v);
        const grid = RuleGrid.withBounds(min, max, dimension);
        for (const literal of rule.condition.getLiterals()) {
            const position = Vector.subtract(literal.position, grid.shift);
            const cell = grid.inputCells.getCellAt(position);
            if (cell === null) {
                throw new Error(
                    `Position ${position.toString()} is out of bounds`,
                );
            }
            if (literal.sign) {
                cell.addSignal(literal.signal);
            } else {
                cell.addNegatedSignal(literal.signal);
            }
        }
        for (const output of rule.outputs) {
            const position = Vector.subtract(output.position, grid.shift);
            const cell = grid.outputCells.getCellAt(position);
            if (cell === null) {
                throw new Error(
                    `Position ${position.toString()} is out of bounds`,
                );
            }
            cell.addSignal(output.signal);
        }
        return grid;
    }

    getDimension(): number {
        return this.inputCells.getDimension();
    }

    clone(): this {
        return new (this.constructor as new (
            inputCells: Configuration,
            outputCells: Configuration,
            shift: Vector,
        ) => this)(
            this.inputCells.clone(),
            this.outputCells.clone(),
            this.shift.clone(),
        );
    }

    makeRule(): Rule {
        return new Rule(
            this.makeRuleCondition(),
            this.makeRuleOutputs(),
        );
    }

    makeRuleCondition(): Clause {
        const literals: Literal[] = [];
        for (const c of this.inputCells.iterPositions()) {
            const cell = this.inputCells.getCellAt(c);
            if (cell === null) {
                continue;
            }
            const position = Vector.add(c, this.shift);
            cell.signals.forEach((signal) => {
                const literal = new Literal(signal, position, true);
                literals.push(literal);
            });
            cell.negatedSignals.forEach((signal) => {
                const literal = new Literal(signal, position, false);
                literals.push(literal);
            });
        }
        if (literals.length === 1) {
            return literals[0];
        } else {
            return new Conjunction(literals);
        }
    }

    makeRuleOutputs(): RuleOutput[] {
        const outputs: RuleOutput[] = [];
        for (const c of this.outputCells.iterPositions()) {
            const cell = this.outputCells.getCellAt(c);
            if (cell === null) {
                continue;
            }
            const position = Vector.add(c, this.shift);
            cell.signals.forEach((signal) => {
                const ruleOutput = new RuleOutput(position, signal);
                outputs.push(ruleOutput);
            });
        }
        return outputs;
    }
}

export default RuleGrid;
