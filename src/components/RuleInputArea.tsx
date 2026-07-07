import CodeMirror from "@uiw/react-codemirror";
import { useState } from "react";
import Automaton from "../classes/Automaton";
import { Button } from "./ui/button";
import Rule from "@/classes/Rule";
import {
    ruleEditorTheme,
    ruleLanguage,
    ruleSyntaxHighlighting,
} from "./ruleLanguage";

interface RuleInputAreaProps {
    automaton: Automaton;
    setAutomaton: (automaton: Automaton) => void;
}

export default function RuleInputArea(props: RuleInputAreaProps) {
    const { automaton, setAutomaton } = props;
    const [rulesText, setRulesText] = useState("");

    function addRules() {
        const { rules, multiSignals } = Rule.parseRulesFromString(rulesText);
        const newAutomaton = automaton.clone();
        newAutomaton.addRules(rules);
        newAutomaton.addMultiSignals(multiSignals);
        setAutomaton(newAutomaton);
    }

    function clearTextArea() {
        setRulesText("");
    }

    return (
        <div>
            <CodeMirror
                value={rulesText}
                onChange={setRulesText}
                placeholder="Enter rules here"
                basicSetup={{
                    foldGutter: false,
                    highlightActiveLine: false,
                    highlightActiveLineGutter: false,
                }}
                extensions={[
                    ruleLanguage,
                    ruleSyntaxHighlighting,
                    ruleEditorTheme,
                ]}
                minHeight="24rem"
                className="w-full overflow-hidden border border-gray-400 bg-white font-mono shadow-md"
            />
            <div className="flex flex-row justify-center w-full gap-2">
                <Button variant="destructive" onClick={clearTextArea}>
                    Clear
                </Button>
                <Button onClick={addRules}>Add rules</Button>
            </div>
        </div>
    );
}
