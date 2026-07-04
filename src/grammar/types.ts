import type { RuleOutput } from "@/classes/Rule.ts";
import Clause from "../classes/Clause.ts";
import { type Signal } from "../types.ts";

export interface Line {
    type: string;
}

export interface EmptyLine extends Line {
    type: "empty_line";
}

export interface BeginFunctionLine extends Line {
    type: "begin_function";
    indent: number;
    function_name: string;
    parameters: string[];
}

export interface EndFunctionLine extends Line {
    type: "end_function";
    indent: number;
}

export interface RuleLine extends Line {
    type: "rule_line";
    indent: number;
    condition: Clause | undefined;
    outputs: RuleOutput[] | undefined;
}

export interface MultiSignalLine extends Line {
    type: "multi_signal";
    indent: number;
    signal: Signal;
    values: Signal[];
}

export type ParsedLine =
    | RuleLine
    | MultiSignalLine
    | BeginFunctionLine
    | EndFunctionLine
    | EmptyLine;
