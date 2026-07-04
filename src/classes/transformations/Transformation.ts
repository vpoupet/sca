import type { MultiSignals } from "@/types";
import Rule from "../Rule";
import { mirror } from "./mirror";
import { mirror_diag } from "./mirror_diag";

export type TransformationParameter = string | number;
export type Transformation = {
    transformRules: (
        rules: Rule[],
        parameters: TransformationParameter[],
    ) => Rule[];
    transformMultiSignals: (
        multiSignals: MultiSignals,
        parameters: TransformationParameter[],
    ) => MultiSignals;
};

// Dummy transformation (does nothing)
const dummy = {
    transformRules: (rules: Rule[], _parameters: TransformationParameter[]) => {
        return rules;
    },

    transformMultiSignals: (
        multiSignals: Map<symbol, Set<symbol>>,
        _parameters: TransformationParameter[],
    ): Map<symbol, Set<symbol>> => {
        return multiSignals;
    },
}

export const transformations: Map<string, Transformation> = new Map([
    ["mirror", mirror],
    ["mirror_diag", mirror_diag],
    ["dummy", dummy],
]);
