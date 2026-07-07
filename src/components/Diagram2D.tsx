import Automaton from "../classes/Automaton.ts";
import { Configuration } from "../classes/Configuration.ts";
import "../style/Cell.scss";

import { useLayoutEffect, useReducer } from "react";
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

type DiagramState = {
    currentStep: number;
    configurationHistory: IndexedConfiguration[];
};

type DiagramAction =
    | {
          type: "changeStep";
          delta: number;
          automaton: Automaton;
      }
    | {
          type: "resetHistory";
          automaton: Automaton;
          initialConfiguration: Configuration;
      };

function makeConfigurationHistory(
    automaton: Automaton,
    initialConfiguration: Configuration,
    currentStep: number,
): IndexedConfiguration[] {
    const configuration = initialConfiguration.clone();
    automaton.applyRewriteRules(configuration);

    return automaton.getHistoryAtTime(currentStep, [
        {
            time: 0,
            configuration,
        },
    ]);
}

function diagramReducer(
    state: DiagramState,
    action: DiagramAction,
): DiagramState {
    switch (action.type) {
        case "changeStep": {
            const currentStep = Math.max(state.currentStep + action.delta, 0);
            return {
                currentStep,
                configurationHistory: action.automaton.getHistoryAtTime(
                    currentStep,
                    state.configurationHistory,
                ),
            };
        }
        case "resetHistory":
            return {
                currentStep: state.currentStep,
                configurationHistory: makeConfigurationHistory(
                    action.automaton,
                    action.initialConfiguration,
                    state.currentStep,
                ),
            };
    }
}

export default function Diagram2D({
    automaton,
    initialConfiguration,
    hiddenSignalsSet,
    // settings,
    colorMap,
}: Props) {
    const [{ currentStep, configurationHistory }, dispatch] = useReducer(
        diagramReducer,
        { automaton, initialConfiguration },
        ({ automaton, initialConfiguration }) => ({
            currentStep: 0,
            configurationHistory: makeConfigurationHistory(
                automaton,
                initialConfiguration,
                0,
            ),
        }),
    );

    useLayoutEffect(() => {
        dispatch({
            type: "resetHistory",
            automaton,
            initialConfiguration,
        });
    }, [automaton, initialConfiguration]);

    function incrementStep() {
        dispatch({ type: "changeStep", delta: 1, automaton });
    }

    function decrementStep() {
        dispatch({ type: "changeStep", delta: -1, automaton });
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
