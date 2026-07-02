import Automaton from "../classes/Automaton.ts";
import { Configuration } from "../classes/Configuration.ts";
import "../style/Cell.scss";

import { useState } from "react";
import type { IndexedConfiguration, SettingsType, Signal } from "../types.ts";
import CellComponent from "./CellComponent.tsx";
import { Config2DComponent } from "./Config2DComponent.tsx";
import Heading from "./Typography.tsx";
import { Button } from "./ui/button.tsx";

type Props = {
    automaton: Automaton;
    initialConfiguration: Configuration;
    hiddenSignalsSet?: Set<Signal>;
    settings: SettingsType;
    colorMap: Map<Signal, string>;
};

export default function Diagram2D({
    automaton,
    initialConfiguration,
    hiddenSignalsSet,
    // settings,
    colorMap,
}: Props) {
    const [currentStep, setCurrentStep] = useState(0);
    const [configurationHistory, setConfigurationHistory] = useState<
        IndexedConfiguration[]
    >([
        {
            time: 0,
            configuration: initialConfiguration,
        },
    ]);

    function incrementStep() {
        const newStep = currentStep + 1;
        setCurrentStep(newStep);
        setConfigurationHistory(
            automaton.getHistoryAtTime(newStep, configurationHistory),
        );
    }

    function decrementStep() {
        const newStep = Math.max(currentStep - 1, 0);
        setCurrentStep(newStep);
        setConfigurationHistory(
            automaton.getHistoryAtTime(newStep, configurationHistory),
        );
    }

    return (
        <div>
            <Heading level={2}>Diagram</Heading>
            <div className="flex items-center gap-2">
                <Button onClick={decrementStep}>Prev</Button>
                <span className="w-8 text-center">{currentStep}</span>
                <Button onClick={incrementStep}>Next</Button>
            </div>
            <div className="flex flex-col justify-center w-full align-middle">
                <Config2DComponent
                    config={configurationHistory.at(-1)!.configuration}
                    hiddenSignalsSet={hiddenSignalsSet}
                    colorMap={colorMap}
                />
            </div>
        </div>
    );
}

interface DiagramRowProps {
    config: Configuration;
    hiddenSignalsSet?: Set<Signal>;
    colorMap: Map<Signal, string>;
}

export function DiagramRow({
    config,
    hiddenSignalsSet,
    colorMap,
}: DiagramRowProps) {
    return (
        <div className="flex flex-row w-full">
            {[...config.iterPositions()].map((c) => {
                const cell = config.getCellAt(c);
                return (
                    <CellComponent
                        key={c.coords.toString()}
                        cell={cell!}
                        hiddenSignalsSet={hiddenSignalsSet}
                        colorMap={colorMap}
                    />
                );
            })}
        </div>
    );
}
