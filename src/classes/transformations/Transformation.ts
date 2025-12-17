import { EvalContext } from "../Clause";
import Rule from "../Rule";
import dummy  from "./dummy";
import  mirror  from "./mirror";

export type TransformationParameter = string | number;
export type TransformationOutput = {
    rules: Rule[];
    context: EvalContext;
};
export type Transformation = (
    rules: Rule[],
    context: EvalContext,
    parameters: TransformationParameter[]
) => TransformationOutput;

export const transformations: Map<string, Transformation> = new Map([
    ["mirror", mirror],
    ["dummy", dummy],
]);
