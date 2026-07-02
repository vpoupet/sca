import RuleGrid from "@/classes/RuleGrid.ts";
import { CircleArrowDown, CircleArrowUp, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Disjunction, simplifyDNF } from "../classes/Clause.ts";
import Rule, { type ConjunctionRule } from "../classes/Rule";
import type { SettingsType, Signal } from "../types";
import Frame from "./common/Frame.tsx";
import RuleGridComponent from "./RuleGridComponent.tsx";
import { Button } from "./ui/button.tsx";

interface RuleComponentProps {
    rule: Rule;
    settings: SettingsType;
    deleteRule: (rule: Rule) => void;
    replaceRule: (oldRule: Rule, newRules: Rule[]) => void;
    grid: RuleGrid;
    setGrid: (grid: RuleGrid) => void;
    colorMap: Map<Signal, string>;
}

export default function RuleComponent(props: RuleComponentProps) {
    const { rule, settings, deleteRule, replaceRule, grid, setGrid, colorMap } =
        props;
    const [isOpen, setIsOpen] = useState(false);

    const conditionAsDNF = useMemo(
        () => simplifyDNF(rule.condition.toDNF()),
        [rule],
    );
    const conjuctionRules: ConjunctionRule[] = useMemo(
        () =>
            conditionAsDNF.subclauses.map((condition) => {
                return new Rule(condition, rule.outputs) as ConjunctionRule;
            }),
        [conditionAsDNF, rule],
    );

    function deleteConjunctionRule(conjRule: Rule) {
        const newCondition = new Disjunction(
            conditionAsDNF.subclauses.filter((c) => c !== conjRule.condition),
        ).simplified();
        replaceRule(rule, [new Rule(newCondition, conjRule.outputs)]);
    }

    function replaceConjunctionRule(conjRule: Rule) {
        const newRule = grid.makeRule();

        if (conjRule.outputs.toString() === newRule.outputs.toString()) {
            // compatible outputs
            const newDNFCondition = new Disjunction(
                conditionAsDNF.subclauses.map((c) => {
                    if (c === conjRule.condition) {
                        return newRule.condition;
                    } else {
                        return c;
                    }
                }),
            ).simplified();
            replaceRule(rule, [new Rule(newDNFCondition, rule.outputs)]);
        } else {
            // incompatible outputs, replace with 2 rules
            const newDNFCondition = new Disjunction(
                conditionAsDNF.subclauses.filter(
                    (c) => c !== conjRule.condition,
                ),
            ).simplified();
            replaceRule(rule, [
                new Rule(newDNFCondition, rule.outputs),
                newRule,
            ]);
        }
    }

    return (
        <Frame className="bg-white">
            <div
                className="flex flex-row justify-between cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="flex flex-row">
                    {isOpen ? (
                        <span className="p-1 mr-2">
                            <CircleArrowUp color="#AAA" />
                        </span>
                    ) : (
                        <span className="p-1 mr-2">
                            <CircleArrowDown color="#AAA" />
                        </span>
                    )}
                    <span className="font-mono">
                        <span className="font-bold text-gray-400">
                            {rule.condition.toString()}
                        </span>
                        &nbsp;:&nbsp;
                        <span className="font-bold text-gray-800">
                            {rule.outputs.map((o) => o.toString()).join(" ")}
                        </span>
                    </span>
                </span>
                <Button
                    className="relative -mt-1 "
                    variant="destructive"
                    onClick={() => deleteRule(rule)}
                >
                    <Trash2 />
                </Button>
            </div>
            {isOpen && (
                <div className="flex flex-row gap-2">
                    {conjuctionRules.map((conjRule) => {
                        return (
                            <RuleGridComponent
                                key={conjRule.toString()}
                                ruleGrid={RuleGrid.fromRule(conjRule, settings.dimension, settings.gridRadius)}
                                setGrid={setGrid}
                                onDelete={() => deleteConjunctionRule(conjRule)}
                                onReplace={() =>
                                    replaceConjunctionRule(conjRule)
                                }
                                colorMap={colorMap}
                            />
                        );
                    })}
                </div>
            )}
        </Frame>
    );
}
