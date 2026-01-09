import { useRef } from "react";
import Automaton from "../classes/Automaton";
import { Button } from "./ui/button";

interface RuleInputAreaProps {
    automaton: Automaton;
    setAutomaton: (automaton: Automaton) => void;
}

export default function RuleInputArea(props: RuleInputAreaProps) {
    const { automaton, setAutomaton } = props;
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    function addRules() {
        if (textAreaRef.current) {
            const rulesText = textAreaRef.current.value;
            setAutomaton(automaton.addRulesFromString(rulesText));
        }
    }

    function clearTextArea() {
        if (textAreaRef.current) {
            textAreaRef.current.value = "";
        }
    }

    return (
        <div>
            <textarea
                id="rulesText"
                className="w-full p-2 font-mono bg-white border border-gray-400 shadow-md"
                cols={60}
                rows={16}
                ref={textAreaRef}
                placeholder="Enter rules here"
            />
            <div className="flex flex-row justify-center w-full gap-2">
                <Button variant="destructive" onClick={clearTextArea}>Clear</Button>
                <Button onClick={addRules}>
                    Add rules
                </Button>
            </div>
        </div>
    );
}
