import { type MultiSignals, type Signal } from "../../types";
import Rule, { RuleOutput } from "../Rule";
import Vector from "../Vector";
import {
    type TransformationParameter
} from "./Transformation";

function mirrorVector2D(vector: Vector): Vector {
    return new Vector([vector.at(1), vector.at(0)]);
}

function switchTags(signal: Signal, tag1: string, tag2: string): Signal {
    let signalName = signal.description;
    if (signalName === undefined || tag1 === undefined || tag2 === undefined) {
        return signal;
    }

    if (signalName.includes(tag1)) {
        signalName = signalName.replace(tag1, tag2);
        return Symbol.for(signalName);
    } else if (signalName.includes(tag2)) {
        signalName = signalName.replace(tag2, tag1);
        return Symbol.for(signalName);
    }
    return signal;
}

export const mirror_diag = {
    transformRules: (rules: Rule[], parameters: TransformationParameter[]) => {
        const tag1 = parameters[0].toString();
        const tag2 = parameters[1].toString();

        const newRules = rules.map(
            (rule) =>
                new Rule(
                    rule.condition.transformLiterals({
                        signal: (s) => switchTags(s, tag1, tag2),
                        position: (p) => mirrorVector2D(p),
                    }),
                    rule.outputs.map(
                        (output) =>
                            new RuleOutput(
                                switchTags(output.signal, tag1, tag2),
                                mirrorVector2D(output.position),
                                output.timeStep,
                            ),
                    ),
                ),
        );
        return [...rules, ...newRules];
    },

    transformMultiSignals: (
        multiSignals: MultiSignals,
        parameters: TransformationParameter[],
    ): MultiSignals => {
        const tag1 = parameters[0].toString();
        const tag2 = parameters[1].toString();

        const newMultiSignals = new Map<Signal, Set<Signal>>(multiSignals);
        for (const [signal, subSignals] of multiSignals.entries()) {
            const newSignal = switchTags(signal, tag1, tag2);
            if (newSignal !== signal) {
                const newSubSignals = new Set(
                    Array.from(subSignals).map((s) =>
                        switchTags(s, tag1, tag2),
                    ),
                );
                newMultiSignals.set(newSignal, newSubSignals);
            }
        }
        return new Map([
            ...multiSignals,
            ...newMultiSignals,
        ]);
    },
};
