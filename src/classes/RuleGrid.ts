import Cell from "./Cell.ts";
import Clause, { Conjunction, Literal } from "./Clause.ts";
import { Configuration, Configuration1D } from "./Configuration.ts";
import Rule, { RuleOutput } from "./Rule.ts";
import Vector from "./Vector.ts";

class RuleGrid {
    inputCells: Configuration;
    outputCells: Configuration[];

    constructor(
        inputCells: Configuration,
        outputCells: Configuration[]
    ) {
        this.inputCells = inputCells;
        this.outputCells = outputCells;
    }

    static withSize(radius: number, nbFutureSteps: number): RuleGrid {
        const nbCells = radius * 2 + 1;
        const inputs = new Configuration1D(
            Array.from({ length: nbCells }, () => new Cell())
        );
        const outputs = Array.from(
            { length: nbFutureSteps },
            () =>
                new Configuration1D(
                    Array.from({ length: nbCells }, () => new Cell())
                )
        );
        return new RuleGrid(inputs, outputs);
    }

    getRadius(): number {
        return (this.inputCells.getSize().at(0) - 1) / 2;
    }

    clone(): this {
        return new (this.constructor as new (
            inputCells: Configuration,
            outputCells: Configuration[]
        ) => this)(
            this.inputCells.clone(),
            this.outputCells.map((row) => row.clone())
        );
    }

    equals(other: RuleGrid): boolean {
        // compare inputs
        if (!this.inputCells.equals(other.inputCells)) {
            return false;
        }
        if (this.outputCells.length !== other.outputCells.length) {
            return false;
        }
        for (let i = 0; i < this.outputCells.length; i++) {
            if (!this.outputCells[i].equals(other.outputCells[i])) {
                return false;
            }
        }
        return true;
    }

    makeRule(centerOrigin: boolean = true): Rule {
        return new Rule(
            this.makeRuleCondition(centerOrigin),
            this.makeRuleOutputs(centerOrigin)
        );
    }

    makeRuleCondition(centerOrigin: boolean = true): Clause {
        const shift = new Vector([centerOrigin ? -this.getRadius() : 0]);
        const literals: Literal[] = [];
        for (const c of this.inputCells.iter()) {
            const cell = this.inputCells.getCellAt(c);
            if (cell === null) {
                continue;
            }
            const position = Vector.add(c, shift);
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
        }
        return new Conjunction(literals);
    }

    makeRuleOutputs(centerOrigin: boolean = true): RuleOutput[] {
        const shift = new Vector([centerOrigin ? -this.getRadius() : 0]);
        const outputs: RuleOutput[] = [];
        this.outputCells.forEach((row, rowIndex) => {
            for (const c of row.iter()) {
                const cell = row.getCellAt(c);
                if (cell === null) {
                    continue;
                }
                const position = Vector.add(c, shift);
                cell.signals.forEach((signal) => {
                    const ruleOutput = new RuleOutput(
                        position,
                        signal,
                        rowIndex + 1
                    );
                    outputs.push(ruleOutput);
                });
            }
        });
        return outputs;
    }
}

export default RuleGrid;
