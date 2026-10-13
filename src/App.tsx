import { useState } from "react";
import { toast } from "sonner";
import Automaton from "./classes/Automaton";
import { Configuration } from "./classes/Configuration";
import RuleGrid from "./classes/RuleGrid";
import Vector from "./classes/Vector";
import DependencyGraphsDialogs from "./components/DependencyGraphsDialogs";
import Diagram1D from "./components/Diagram1D";
import Diagram2D from "./components/Diagram2D";
import EditGrid from "./components/EditGrid";
import RuleInputArea from "./components/RuleInputArea";
import RulesList from "./components/RulesList";
import SetInitialConfigurationButton from "./components/SetInitialConfigurationButton";
import SettingsComponent from "./components/SettingsComponent";
import SignalsList from "./components/SignalsList";
import Heading from "./components/Typography";
import "./style/Cell.scss";
import { randomColor } from "./style/materialColors";
import type { SettingsType, Signal } from "./types";

const defaultSettings: SettingsType = {
    dimension: 1,
    gridRadius: 2,
    nbCells: 20,
    nbSteps: 20,
    timeGoesUp: true,
};

export default function App() {
    const [settings, setSettings] = useState(defaultSettings);
    const [colorPickingSignal, setColorPickingSignal] = useState<
        Signal | undefined
    >(undefined);
    const [colorMap, setColorMap] = useState(new Map<Signal, string>());
    // const dim = settings.dimension;
    const [automataHistory, setAutomataHistory] = useState<Automaton[]>([
        new Automaton(),
    ]);
    const [automatonIndex, setAutomatonIndex] = useState(0);
    const [dimension, setDimension] = useState(1);
    const v = Vector.one(dimension).mult(settings.gridRadius);
    const [grid, setGrid] = useState<RuleGrid>(
        RuleGrid.withBounds(v.negated(), v, dimension),
    );
    const [activeInputCells, setActiveInputCells] = useState<Vector[]>([]);
    const [activeOutputCells, setActiveOutputCells] = useState<Vector[]>([]);

    const [hiddenSignalsSet, setHiddenSignalsSet] = useState<Set<Signal>>(
        new Set(),
    );

    const [extraSignalsSet, setExtraSignalsSet] = useState<Set<Signal>>(
        new Set([Symbol.for("Init")]),
    );

    const [
        userDefinedInitialConfiguration,
        setUserDefinedInitialConfiguration,
    ] = useState<Configuration | null>(null);

    const automaton = automataHistory[automatonIndex];

    const signalsList = Array.from(
        automaton.signals.union(extraSignalsSet),
    ).sort((a, b) => {
        const descA = a.description || "";
        const descB = b.description || "";
        return descA.localeCompare(descB);
    });

    const uncoloredSignals = signalsList.filter(
        (signal) => !colorMap.has(signal),
    );
    if (uncoloredSignals.length > 0) {
        const newColorMap = new Map(colorMap);
        for (const signal of uncoloredSignals) {
            newColorMap.set(signal, randomColor());
        }
        setColorMap(newColorMap);
    }

    function changeIndexAutomaton(deltaIndex: number) {
        const index = automatonIndex + deltaIndex;
        if (index < 0 || index >= automataHistory.length) {
            return;
        }
        setAutomatonIndex(index);
        setDimension(automataHistory[index].getDimension());
    }

    function setAutomaton(automaton: Automaton) {
        if (automaton === automataHistory[automatonIndex]) {
            // automaton hasn't changed
            return;
        }

        if (automatonIndex < automataHistory.length - 1) {
            setAutomataHistory([
                ...automataHistory.slice(0, automatonIndex + 1),
                automaton,
            ]);
        } else {
            setAutomataHistory([...automataHistory, automaton]);
        }
        setAutomatonIndex(automatonIndex + 1);
        setDimension(automaton.getDimension());
    }

    function setSignalColor(signal: Signal, color: string) {
        const newColorMap = new Map(colorMap);
        newColorMap.set(signal, color);
        setColorMap(newColorMap);
    }

    function exportRules() {
        const rules = automaton.rules.map((rule) => rule.toString()).join("\n");
        navigator.clipboard.writeText(rules);
        // TODO: add a toast notification
        toast.success("Rules copied to clipboard");
    }

    return (
        <div className="flex flex-col min-h-screen p-2 text-gray-700 bg-linear-to-b from-slate-50 to-slate-100">
            <Heading level={1}>Signal-based cellular automata</Heading>
            <SettingsComponent settings={settings} setSettings={setSettings} />
            <DependencyGraphsDialogs automaton={automaton} />
            <SignalsList
                automaton={automaton}
                setAutomaton={setAutomaton}
                extraSignalsSet={extraSignalsSet}
                setExtraSignalsSet={setExtraSignalsSet}
                hiddenSignalsSet={hiddenSignalsSet}
                setHiddenSignalsSet={setHiddenSignalsSet}
                colorMap={colorMap}
                setColorMap={setColorMap}
                colorPickingSignal={colorPickingSignal}
                setColorPickingSignal={setColorPickingSignal}
                setSignalColor={setSignalColor}
            />
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="lg:w-1/2">
                    <EditGrid
                        grid={grid}
                        setGrid={setGrid}
                        settings={settings}
                        automaton={automaton}
                        setAutomaton={setAutomaton}
                        extraSignalsSet={extraSignalsSet}
                        activeInputCells={activeInputCells}
                        setActiveInputCells={setActiveInputCells}
                        activeOutputCells={activeOutputCells}
                        setActiveOutputCells={setActiveOutputCells}
                        colorMap={colorMap}
                    />
                </div>
                <div className="flex flex-col gap-1 lg:w-1/2">
                    <RuleInputArea
                        automaton={automataHistory[automatonIndex]}
                        setAutomaton={setAutomaton}
                    />
                    <SetInitialConfigurationButton
                        setInitialConfiguration={
                            setUserDefinedInitialConfiguration
                        }
                        setColorMap={setColorMap}
                    />
                </div>
            </div>
            <RulesList
                automaton={automaton}
                setAutomaton={setAutomaton}
                automatonIndex={automatonIndex}
                changeIndexAutomaton={changeIndexAutomaton}
                automataHistoryLength={automataHistory.length}
                exportRules={exportRules}
                grid={grid}
                setGrid={setGrid}
                settings={settings}
                colorMap={colorMap}
            />
            {dimension === 1 && (
                <Diagram1D
                    key={`1d-${userDefinedInitialConfiguration?.id}`}
                    automaton={automataHistory[automatonIndex]}
                    initialConfiguration={userDefinedInitialConfiguration}
                    hiddenSignalsSet={hiddenSignalsSet}
                    settings={settings}
                    colorMap={colorMap}
                />
            )}
            {dimension === 2 && (
                <Diagram2D
                    key={`2d-${userDefinedInitialConfiguration?.id}`}
                    automaton={automataHistory[automatonIndex]}
                    initialConfiguration={userDefinedInitialConfiguration}
                    hiddenSignalsSet={hiddenSignalsSet}
                    settings={settings}
                    colorMap={colorMap}
                />
            )}
        </div>
    );
}
