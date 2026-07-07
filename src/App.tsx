import { useMemo, useState } from "react";
import { toast } from "sonner";
import Automaton from "./classes/Automaton";
import {
    Configuration,
    Configuration1D,
    Configuration2D,
} from "./classes/Configuration";
import RuleGrid from "./classes/RuleGrid";
import Vector from "./classes/Vector";
import Diagram1D from "./components/Diagram1D";
import Diagram2D from "./components/Diagram2D";
import DependencyGraphsDialogs from "./components/DependencyGraphsDialogs";
import RuleInputArea from "./components/RuleInputArea";
import RulesList from "./components/RulesList";
import SettingsComponent from "./components/SettingsComponent";
import SignalsList from "./components/SignalsList";
import Heading from "./components/Typography";
import "./style/Cell.scss";
import { randomColor } from "./style/materialColors";
import type { SettingsType, Signal } from "./types";
import SetInitialConfigurationButton from "./components/SetInitialConfigurationButton";
import EditGrid from "./components/EditGrid";

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
    const dim = settings.dimension;
    const v = Vector.one(dim).mult(settings.gridRadius);
    const [grid, setGrid] = useState<RuleGrid>(
        RuleGrid.withBounds(v.negated(), v, dim),
    );
    const [activeInputCells, setActiveInputCells] = useState<Vector[]>([]);
    const [activeOutputCells, setActiveOutputCells] = useState<Vector[]>([]);

    const [hiddenSignalsSet, setHiddenSignalsSet] = useState<Set<Signal>>(
        new Set(),
    );
    const [automataHistory, setAutomataHistory] = useState<Automaton[]>([
        new Automaton(),
    ]);
    const [automatonIndex, setAutomatonIndex] = useState(0);

    const [extraSignalsSet, setExtraSignalsSet] = useState<Set<Signal>>(
        new Set([Symbol.for("Init")]),
    );

    function makeInitialConfiguration(
        dimension: number,
        nbCells: number,
    ): Configuration {
        if (dimension === 2) {
            const config = Configuration2D.withSize(
                new Vector([nbCells, nbCells]),
            );
            config.getCellAt(new Vector())?.addSignal(Symbol.for("Init"));
            return config;
        } else {
            const config = Configuration1D.withSize(new Vector([nbCells]));
            config.getCellAt(new Vector([0]))?.addSignal(Symbol.for("Init"));
            return config;
        }
    }

    const [
        userDefinedInitialConfiguration,
        setUserDefinedInitialConfiguration,
    ] = useState<Configuration | null>(null);

    const initialConfiguration = useMemo(() => {
        if (userDefinedInitialConfiguration) {
            return userDefinedInitialConfiguration;
        }
        return makeInitialConfiguration(settings.dimension, settings.nbCells);
    }, [settings.dimension, settings.nbCells, userDefinedInitialConfiguration]);

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
        if (
            automatonIndex + deltaIndex < 0 ||
            automatonIndex + deltaIndex >= automataHistory.length
        ) {
            return;
        }
        setAutomatonIndex(automatonIndex + deltaIndex);
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
        <div className="flex flex-col w-screen min-h-screen p-2 text-gray-700 bg-linear-to-b from-slate-50 to-slate-100">
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
            {settings.dimension === 1 ? (
                <Diagram1D
                    key={`1d-${initialConfiguration.id}`}
                    automaton={automataHistory[automatonIndex]}
                    initialConfiguration={initialConfiguration!}
                    hiddenSignalsSet={hiddenSignalsSet}
                    settings={settings}
                    colorMap={colorMap}
                />
            ) : (
                <Diagram2D
                    key={`2d-${initialConfiguration.id}`}
                    automaton={automataHistory[automatonIndex]}
                    initialConfiguration={initialConfiguration}
                    hiddenSignalsSet={hiddenSignalsSet}
                    settings={settings}
                    colorMap={colorMap}
                />
            )}
        </div>
    );
}
