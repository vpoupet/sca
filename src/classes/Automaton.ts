import type { IndexedConfiguration, MultiSignals, Signal } from "../types.ts";
import { EvalContext } from "./Clause.ts";
import { Configuration } from "./Configuration.ts";
import DirectedGraph from "./Graph.ts";
import Rule, { NextStepRule, RewriteRule, type Ruleset } from "./Rule.ts";
import Vector from "./Vector.ts";

export default class Automaton {
    /**
     * List of signals used by the automaton
     */
    signals: Set<Signal>;
    /**
     * Map of multi-signals
     */
    multiSignals: MultiSignals;
    /**
     * List of rules of the automaton
     * (the rules are executed on each cell in the order they appear in the list)
     */
    rules: NextStepRule[];
    /**
     * List of "rewrite rules". The rewrite rules are special rules that are
     * applied directly to the current configuration (same time step).
     * They should only be used either to set up the initial configuration, or
     * to simplify some rules. In order to represent something that can be done
     * with regular CA rules, rewrite rules should only depend on signals in
     * the 0-cell and produce outputs on that cell only.
     */
    rewriteRules: RewriteRule[];
    /**
     * List of strings representing the rules. Used to avoid duplicate rules.
     */
    ruleNames: Set<string>;
    /**
     * Position of the leftmost neighbor used in the rules
     */
    minNeighbor: Vector;
    /**
     * Position of the rightmost neighbor used in the rules
     */
    maxNeighbor: Vector;

    constructor(automaton?: Automaton) {
        if (automaton === undefined) {
            this.rules = [];
            this.rewriteRules = [];
            this.ruleNames = new Set();
            this.multiSignals = new Map();
            this.signals = new Set();
            this.minNeighbor = new Vector();
            this.maxNeighbor = new Vector();
        } else {
            this.rules = [...automaton.rules];
            this.rewriteRules = [...automaton.rewriteRules];
            this.ruleNames = new Set(automaton.ruleNames);
            this.multiSignals = new Map(automaton.multiSignals);
            this.signals = new Set(automaton.signals);
            this.minNeighbor = automaton.minNeighbor;
            this.maxNeighbor = automaton.maxNeighbor;
        }
    }

    clone(): Automaton {
        return new Automaton(this);
    }

    addNextStepRule(rule: NextStepRule): void {
        if (rule.condition.isAlwaysFalse()) {
            // skip rules that never apply
            return;
        }

        const conditionName = rule.condition.toString();
        const ruleName = rule.toString();
        if (this.ruleNames.has(ruleName)) {
            // skip duplicate rules
            return;
        }

        // check if the rule should be merged with an existing rule having same condition
        let didMerge = false;
        for (const [i, otherRule] of this.rules.entries()) {
            if (otherRule.condition.toString() === conditionName) {
                // add outputs to existing rule
                const newOutputs = [...otherRule.outputs];
                for (const output of rule.outputs) {
                    if (!newOutputs.some((o) => o.equals(output))) {
                        newOutputs.push(output);
                    }
                }
                const mergedRule = new NextStepRule(rule.condition, newOutputs);
                this.rules.splice(i, 1, mergedRule);
                this.ruleNames.delete(otherRule.toString());
                this.ruleNames.add(mergedRule.toString());
                didMerge = true;
                break;
            }
        }
        // if the rule was not merged, add it to the list
        if (!didMerge) {
            this.rules.push(rule);
            this.ruleNames.add(ruleName);
        }

        // update signals, minNeighbor and maxNeighbor
        for (const signal of rule.getSignals()) {
            this.signals.add(signal);
        }
        for (const literal of rule.condition.getLiterals()) {
            this.minNeighbor = Vector.min(this.minNeighbor, literal.position);
            this.maxNeighbor = Vector.max(this.maxNeighbor, literal.position);
        }
    }

    addRewriteRule(rule: RewriteRule): void {
        if (rule.condition.isAlwaysFalse()) {
            // skip rules that never apply
            return;
        }

        const conditionName = rule.condition.toString();
        const ruleName = rule.toString();
        if (this.ruleNames.has(ruleName)) {
            // skip duplicate rules
            return;
        }

        // check if the rule should be merged with an existing rule having same condition
        let didMerge = false;
        for (const [i, otherRule] of this.rewriteRules.entries()) {
            if (otherRule.condition.toString() === conditionName) {
                // add outputs to existing rule
                const newOutputs = [...otherRule.outputs];
                for (const output of rule.outputs) {
                    if (!newOutputs.some((o) => o.equals(output))) {
                        newOutputs.push(output);
                    }
                }
                const mergedRule = new RewriteRule(rule.condition, newOutputs);
                this.rewriteRules.splice(i, 1, mergedRule);
                this.ruleNames.delete(otherRule.toString());
                this.ruleNames.add(mergedRule.toString());
                didMerge = true;
                break;
            }
        }
        // if the rule was not merged, add it to the list
        if (!didMerge) {
            this.rewriteRules.push(rule);
            this.ruleNames.add(ruleName);
        }

        // update signals
        for (const signal of rule.getSignals()) {
            this.signals.add(signal);
        }
    }

    addRuleset(ruleset: Ruleset): void {
        for (const rule of ruleset.rewrite) {
            this.addRewriteRule(rule);
        }
        for (const rule of ruleset.nextStep) {
            this.addNextStepRule(rule);
        }
    }

    addRules(rules: Rule[]): void {
        this.addRuleset(Rule.makeRuleset(rules));
    }

    addMultiSignal(signal: Signal, subSignals: Set<Signal>): void {
        this.multiSignals.set(signal, subSignals);
        this.signals.add(signal);
        for (const subSignal of subSignals) {
            this.signals.add(subSignal);
        }
    }

    addMultiSignals(multiSignals: MultiSignals): void {
        for (const [signal, subSignals] of multiSignals.entries()) {
            this.addMultiSignal(signal, subSignals);
        }
    }

    updateMinMaxNeighbor(): void {
        this.minNeighbor = new Vector();
        this.maxNeighbor = new Vector();
        for (const rule of this.rules) {
            for (const literal of rule.condition.getLiterals()) {
                this.minNeighbor.mutateMin(literal.position);
                this.maxNeighbor.mutateMax(literal.position);
            }
        }
    }

    /**
     * @returns the automaton's context needed to evaluate rules
     */
    getEvalContext(): EvalContext {
        return new EvalContext(this.multiSignals);
    }

    /**
     * Returns the list of signals used by the automaton in alphabetical order
     *
     * @param extraSignals an optional set of signals to add to the list (for signals that are not used in the rules)
     * @returns an ordered list of signals
     */
    getSignalsList(extraSignals?: Set<Signal>): Signal[] {
        if (extraSignals === undefined) {
            extraSignals = new Set();
        }

        return Array.from(this.signals.union(extraSignals)).sort((a, b) => {
            const descriptionA = a.description || "";
            const descriptionB = b.description || "";
            return descriptionA.localeCompare(descriptionB);
        });
    }

    /**
     * Adds rules to the automaton from a string describing the rules.
     * The string is parsed with the grammar defined in grammar.ne
     *
     * @param inputString a string describing the rules to add to the automaton
     * @returns a new Automaton with the added rules
     */
    addRulesFromString(inputString: string): void {
        const { rules, multiSignals } = Rule.parseRulesFromString(inputString);
        this.addRules(rules);
        this.addMultiSignals(multiSignals);
    }

    /**
     * Tests whether the Automaton already has a rule with the same description as the given rule
     *
     * @param rule the rule to check
     * @returns true if the rule is already in the automaton, false otherwise
     */
    hasRule(rule: Rule): boolean {
        return this.ruleNames.has(rule.toString());
    }

    /**
     * Deletes a rule from the automaton
     *
     * @param rule the rule to delete
     * @returns a new Automaton without the rule
     */
    deleteRule(rule: Rule): void {
        this.rules = this.rules.filter((r) => r !== rule);
        this.rewriteRules = this.rewriteRules.filter((r) => r !== rule);
    }

    /**
     * Replaces a rule with a list of rules
     *
     * @param oldRule the rule to replace
     * @param newRules the list of rules to replace it with
     */
    replaceRule(oldRule: Rule, newRules: Rule[]): void {
        const newRuleset = Rule.makeRuleset(newRules);
        const newNextStepRulesNames = new Set(
            newRuleset.nextStep.map((r) => r.toString()),
        );
        const newRewriteRulesNames = new Set(
            newRuleset.rewrite.map((r) => r.toString()),
        );
        if (
            newNextStepRulesNames.has(oldRule.toString()) ||
            newRewriteRulesNames.has(oldRule.toString())
        ) {
            // keep the old rule
            this.addRuleset(newRuleset);
        } else {
            this.rules = this.rules.filter((r) => r !== oldRule);
            this.rules.push(...newRuleset.nextStep);
            this.rewriteRules = this.rewriteRules.filter((r) => r !== oldRule);
            this.rewriteRules.push(...newRuleset.rewrite);
        }
    }

    getDimension(): number {
        return Math.max(...this.rules.map((rule) => rule.getDimension()), 0);
    }

    applyRewriteRules(config: Configuration) {
        const evalContext = this.getEvalContext();
        for (const rule of this.rewriteRules) {
            for (const c of config.iterPositions()) {
                if (rule.condition.eval(config, c, evalContext)) {
                    rule.outputs.forEach((output) => {
                        config.addSignalAt(
                            Vector.add(c, output.position),
                            output.signal,
                        );
                    });
                }
            }
        }
    }

    applyRules(config: Configuration): Configuration {
        const inputConfiguration = config.clone();
        const outputConfiguration = Configuration.withSize(
            inputConfiguration.getSize(),
        );

        const evalContext = this.getEvalContext();
        for (const rule of this.rules) {
            for (const c of inputConfiguration.iterPositionsWithNeighborhood(
                this.minNeighbor,
                this.maxNeighbor,
            )) {
                if (rule.condition.eval(inputConfiguration, c, evalContext)) {
                    rule.outputs.forEach((output) => {
                        outputConfiguration.addSignalAt(
                            Vector.add(c, output.position),
                            output.signal,
                        );
                    });
                }
            }
        }
        this.applyRewriteRules(outputConfiguration);
        return outputConfiguration;
    }

    getHistoryAtTime(
        time: number,
        history: IndexedConfiguration[],
    ): IndexedConfiguration[] {
        let i = history.length - 1;
        while (history[i].time > time) {
            i -= 1;
        }
        const newHistory = history.slice(0, i + 1);
        let lastIndexedConfiguration = newHistory[i];
        while (lastIndexedConfiguration.time < time) {
            lastIndexedConfiguration = {
                time: lastIndexedConfiguration.time + 1,
                configuration: this.applyRules(
                    lastIndexedConfiguration.configuration,
                ),
            };
            newHistory.push(lastIndexedConfiguration);
        }
        // reduce history size
        for (let i = newHistory.length - 1; i >= 2; i--) {
            if (
                2 * (time - newHistory[i].time) >=
                time - newHistory[i - 2].time
            ) {
                // remove newHistory[i - 1]
                newHistory.splice(i - 1, 1);
            }
        }
        return newHistory;
    }

    static reduceHistory(
        history: IndexedConfiguration[],
    ): IndexedConfiguration[] {
        const t0 = history.at(-1)!.time;
        let i = history.length - 1;
        while (i >= 2) {
            if (2 * (t0 - history[i].time) >= t0 - history[i - 2].time) {
                // remove history[i]
                history.splice(i - 1, 1);
            }
            i -= 1;
        }
        return history;
    }

    /**
     * Generates a space-time diagram of the automaton starting from the given configuration
     *
     * @param initialConfiguration the initial configuration
     * @param nbSteps the number of steps to compute
     * @returns a list of configurations representing the space-time diagram
     */
    makeDiagram(
        initialConfiguration: Configuration,
        nbSteps: number,
    ): Configuration[] {
        const diagram = [];
        const configuration = initialConfiguration.clone();
        this.applyRewriteRules(configuration);
        diagram.push(configuration);
        for (let t = 0; t < nbSteps; t++) {
            diagram.push(this.applyRules(diagram[t]));
        }
        return diagram;
    }

    replaceSignal(oldSignal: Signal, newSignal: Signal): void {
        this.rules = this.rules.map((rule) =>
            rule.replaceSignal(oldSignal, newSignal),
        );
        this.rewriteRules = this.rewriteRules.map((rule) =>
            rule.replaceSignal(oldSignal, newSignal),
        );
        const newMultiSignals = new Map(this.multiSignals);
        if (newMultiSignals.has(oldSignal)) {
            const subSignals = newMultiSignals.get(oldSignal);
            newMultiSignals.delete(oldSignal);
            newMultiSignals.set(newSignal, subSignals!);
        }
        for (const [signal, subSignals] of newMultiSignals.entries()) {
            if (subSignals.has(oldSignal)) {
                const newSubSignals = new Set(subSignals);
                newSubSignals.delete(oldSignal);
                newSubSignals.add(newSignal);
                newMultiSignals.set(signal, newSubSignals);
            }
        }
        this.multiSignals = newMultiSignals;
    }

    makeDependencyGraph(): DirectedGraph<Signal> {
        const graph = new DirectedGraph<Signal>();
        const evalContext = this.getEvalContext();

        for (const signal of this.signals) {
            graph.addVertex(signal);
        }
        for (const rule of this.rules) {
            for (const inputLiteral of rule.condition.getLiterals()) {
                for (const inputSignal of evalContext.getSignalsFor(
                    inputLiteral.signal,
                )) {
                    for (const output of rule.outputs) {
                        graph.addEdge(inputSignal, output.signal);
                    }
                }
            }
        }
        return graph;
    }

    toString(): string {
        return this.rules.map((rule) => rule.toString()).join("\n");
    }
}
