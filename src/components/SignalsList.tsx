import React, { useState } from "react";
import Automaton from "../classes/Automaton";
import type { Signal } from "../types";
import MaterialColorPicker from "./MaterialColorPicker";
import SignalName from "./SignalName";
import {
    CheckCircle,
    CircleArrowDown,
    CircleArrowUp,
    CircleX,
    Edit,
    Trash2,
} from "lucide-react";
import { Button } from "./ui/button";
import Heading from "./Typography";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";

type SignalsListProps = {
    automaton: Automaton;
    setAutomaton: (automaton: Automaton) => void;
    extraSignalsSet: Set<Signal>;
    setExtraSignalsSet: (signals: Set<Signal>) => void;
    hiddenSignalsSet: Set<Signal>;
    setHiddenSignalsSet: React.Dispatch<React.SetStateAction<Set<Signal>>>;
    colorMap: Map<Signal, string>;
    setColorMap: (colorMap: Map<Signal, string>) => void;
    colorPickingSignal: Signal | undefined;
    setColorPickingSignal: (signal: Signal | undefined) => void;
    setSignalColor: (signal: Signal, color: string) => void;
};

export default function SignalsList({
    automaton,
    setAutomaton,
    extraSignalsSet,
    setExtraSignalsSet,
    hiddenSignalsSet,
    setHiddenSignalsSet,
    colorMap,
    setColorMap,
    colorPickingSignal,
    setColorPickingSignal,
    setSignalColor,
}: SignalsListProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [newSignalValue, setNewSignalValue] = useState("");
    const signalsList = automaton.getSignalsList(extraSignalsSet);

    function replaceSignal(oldValue: Signal, newValue: Signal): void {
        if (oldValue === newValue) {
            return;
        }

        if (automaton.signals.has(newValue) || extraSignalsSet.has(newValue)) {
            alert(`Le signal ${newValue.description} existe déjà.`);
            return;
        }

        if (extraSignalsSet.has(oldValue)) {
            setExtraSignalsSet(
                new Set(
                    [...extraSignalsSet].map((signal) =>
                        signal === oldValue ? newValue : signal
                    )
                )
            );
        }

        const newColorMap = new Map(colorMap);
        newColorMap.set(newValue, colorMap.get(oldValue) ?? "#000");
        setColorMap(newColorMap);

        if (automaton.signals.has(oldValue)) {
            const newAutomaton = automaton.clone();
            newAutomaton.replaceSignal(oldValue, newValue);
            setAutomaton(newAutomaton);
        }
    }

    function addExtraSignal(): void {
        const validSignalNames = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;
        if (!newSignalValue.match(validSignalNames)) {
            alert("Nom de signal invalide.");
            return;
        }

        const newSignal = Symbol.for(newSignalValue);
        if (
            automaton.signals.has(newSignal) ||
            extraSignalsSet.has(newSignal)
        ) {
            alert(`Le signal ${newSignalValue} existe déjà.`);
            return;
        }

        setExtraSignalsSet(new Set([...extraSignalsSet, newSignal]));
        setNewSignalValue("");
    }

    function deleteExtraSignal(signal: Signal): void {
        const newExtraSignalsSet = new Set(extraSignalsSet);
        newExtraSignalsSet.delete(signal);
        setExtraSignalsSet(newExtraSignalsSet);
    }

    function setIsVisible(signal: Signal, isVisible: boolean) {
        const newHiddenSignalsSet = new Set(hiddenSignalsSet);
        if (isVisible) {
            newHiddenSignalsSet.delete(signal);
        } else {
            newHiddenSignalsSet.add(signal);
        }
        setHiddenSignalsSet(newHiddenSignalsSet);
    }

    function toggleAllSignals() {
        if (hiddenSignalsSet.size === 0) {
            setHiddenSignalsSet(new Set(signalsList));
        } else {
            setHiddenSignalsSet(new Set());
        }
    }

    return (
        <div className="w-full my-4">
            <span
                className="cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <Heading level={2} className="flex flex-row items-center gap-4">
                    Signals list{" "}
                    {isExpanded ? (
                        <CircleArrowUp color="#AAA" />
                    ) : (
                        <CircleArrowDown color="#AAA" />
                    )}
                </Heading>
            </span>
            {isExpanded && (
                <div className="flex flex-col items-center gap-1">
                    <Button onClick={toggleAllSignals} variant="secondary" className="w-48">
                        Toggle selection
                    </Button>
                    <div className="flex flex-col w-fit">
                        {signalsList.map((signal) => (
                            <SignalsListItem
                                key={signal.description}
                                signal={signal}
                                colorMap={colorMap}
                                isVisible={!hiddenSignalsSet.has(signal)}
                                setIsVisible={(value) =>
                                    setIsVisible(signal, value)
                                }
                                replaceSignal={(value) =>
                                    replaceSignal(signal, Symbol.for(value))
                                }
                                canDeleteSignal={!automaton.signals.has(signal)}
                                deleteSignal={() => deleteExtraSignal(signal)}
                                isSelectingColor={signal === colorPickingSignal}
                                setIsSelectingColor={(value) => {
                                    if (value) {
                                        setColorPickingSignal(signal);
                                    } else {
                                        setColorPickingSignal(undefined);
                                    }
                                }}
                                setColor={(color) =>
                                    setSignalColor(signal, color)
                                }
                            />
                        ))}
                    </div>
                    <span className="flex flex-row justify-center gap-1">
                        <Input
                            className="p-2 border border-gray-400 max-w-96"
                            value={newSignalValue}
                            onChange={(e) => setNewSignalValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    addExtraSignal();
                                }
                            }}
                            placeholder="Add new signal"
                        />
                        <Button onClick={addExtraSignal}>Add</Button>
                    </span>
                </div>
            )}
        </div>
    );
}

interface SignalsListItemProps {
    signal: Signal;
    colorMap: Map<Signal, string>;
    isVisible: boolean;
    setIsVisible: (value: boolean) => void;
    replaceSignal: (value: string) => void;
    canDeleteSignal: boolean;
    deleteSignal: () => void;
    setColor: (color: string) => void;
    isSelectingColor: boolean;
    setIsSelectingColor: (value: boolean) => void;
}

function SignalsListItem(props: SignalsListItemProps) {
    const {
        signal,
        colorMap,
        isVisible,
        setIsVisible,
        replaceSignal,
        canDeleteSignal,
        deleteSignal,
        setColor,
        isSelectingColor,
        setIsSelectingColor,
    } = props;
    const signalName = Symbol.keyFor(signal) ?? "";
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(signalName);

    return (
        <div
            key={signal.description}
            className="relative flex justify-between min-w-72"
        >
            {isSelectingColor && (
                <MaterialColorPicker
                    chooseColor={(color) => {
                        setColor(color);
                        setIsSelectingColor(false);
                    }}
                    closeColorPicker={() => setIsSelectingColor(false)}
                />
            )}
            <span className="flex items-center gap-2">
                <Checkbox
                    onCheckedChange={(checkedState) =>
                        setIsVisible(Boolean(checkedState))
                    }
                    checked={isVisible}
                />
                {isEditing ? (
                    <Input
                        className="mr-1"
                        value={editValue}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                replaceSignal(editValue);
                                setIsEditing(false);
                            } else if (e.key === "Escape") {
                                setIsEditing(false);
                            }
                        }}
                        onChange={(e) => setEditValue(e.target.value)}
                    />
                ) : (
                    <SignalName
                        signal={signal}
                        colorMap={colorMap}
                        onClickColor={() => setIsSelectingColor(true)}
                    />
                )}
            </span>
            <span className="flex gap-2">
                {isEditing ? (
                    <span className="flex gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                                replaceSignal(editValue);
                                setIsEditing(false);
                            }}
                        >
                            <CheckCircle />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                                setIsEditing(false);
                            }}
                        >
                            <CircleX />
                        </Button>
                    </span>
                ) : (
                    <span className="flex gap-1">
                        <Button
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => {
                                setEditValue(signalName);
                                setIsEditing(true);
                            }}
                        >
                            <Edit />
                        </Button>
                        {canDeleteSignal && (
                            <Button
                                variant="outline"
                                className="cursor-pointer"
                                onClick={deleteSignal}
                            >
                                <Trash2 />
                            </Button>
                        )}
                    </span>
                )}
            </span>
        </div>
    );
}
