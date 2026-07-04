import type RuleGrid from "@/classes/RuleGrid";
import { CircleArrowDown, CircleArrowUp, Clipboard, Redo, Undo } from "lucide-react";
import { useState } from "react";
import Automaton from "../classes/Automaton";
import Rule from "../classes/Rule";
import type { SettingsType, Signal } from "../types";
import RuleComponent from "./RuleComponent";
import Heading from "./Typography";
import { Button } from "./ui/button";

interface RulesListProps {
    automaton: Automaton;
    automatonIndex: number;
    automataHistoryLength: number;
    setAutomaton: (automaton: Automaton) => void;
    changeIndexAutomaton: (index: number) => void;
    exportRules: () => void;
    grid: RuleGrid;
    setGrid: (grid: RuleGrid) => void;
    settings: SettingsType;
    colorMap: Map<Signal, string>;
}

export default function RulesList(props: RulesListProps) {
    const {
        automaton,
        automatonIndex,
        automataHistoryLength,
        setAutomaton,
        changeIndexAutomaton,
        exportRules,
        grid,
        setGrid,
        settings,
        colorMap,
    } = props;
    const [isExpanded, setIsExpanded] = useState(true);

    function deleteRule(rule: Rule) {
        const newAutomaton = automaton.clone();
        newAutomaton.deleteRule(rule);
        setAutomaton(newAutomaton);
    }

    function replaceRule(oldRule: Rule, newRules: Rule[]) {
        const newAutomaton = automaton.clone();
        automaton.replaceRule(oldRule, newRules)
        setAutomaton(newAutomaton);
    }

    return (
        <div className="my-4">
            <span
                className="cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <Heading className="flex flex-row items-center gap-4" level={2}>
                    Rules{" "}
                    {isExpanded ? (
                        <CircleArrowUp color="#AAA" />
                    ) : (
                        <CircleArrowDown color="#AAA" />
                    )}
                </Heading>
            </span>
            <span className="flex flex-row gap-1">
                <Button
                    onClick={() => changeIndexAutomaton(-1)}
                    disabled={automatonIndex === 0}
                    className="flex flex-row items-center gap-2"
                >
                    <Undo />({automatonIndex})
                </Button>
                <Button
                    onClick={() => changeIndexAutomaton(1)}
                    disabled={automatonIndex >= automataHistoryLength - 1}
                    className="flex flex-row items-center gap-2"
                >
                    <Redo /> ({automataHistoryLength - automatonIndex - 1})
                </Button>
                <Button variant="destructive" onClick={() => setAutomaton(new Automaton())}>
                    Clear rules
                </Button>
                <Button onClick={exportRules}>
                    <Clipboard />
                </Button>
            </span>
            {isExpanded && (
                <div className="flex flex-col gap-2 m-2">
                    {automaton.rewriteRules.map((rule) => (
                        <RuleComponent
                            key={rule.toString()}
                            rule={rule}
                            settings={settings}
                            deleteRule={deleteRule}
                            replaceRule={replaceRule}
                            grid={grid}
                            setGrid={setGrid}
                            colorMap={colorMap}
                        />
                    ))}
                    {automaton.rules.map((rule) => (
                        <RuleComponent
                            key={rule.toString()}
                            rule={rule}
                            settings={settings}
                            deleteRule={deleteRule}
                            replaceRule={replaceRule}
                            grid={grid}
                            setGrid={setGrid}
                            colorMap={colorMap}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
