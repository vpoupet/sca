import Automaton from "../classes/Automaton.ts";
import { Configuration } from "../classes/Configuration.ts";
import "../style/Cell.scss";

import type { SettingsType, Signal } from "../types.ts";
import CellComponent from "./CellComponent.tsx";
import { Config1DComponent } from "./Config1DComponent.tsx";
import Heading from "./Typography.tsx";

type Props ={
    automaton: Automaton;
    initialConfiguration: Configuration;
    hiddenSignalsSet?: Set<Signal>;
    settings: SettingsType;
    colorMap: Map<Signal, string>;
}

export default function Diagram1D({
    automaton,
    initialConfiguration,
    hiddenSignalsSet,
    settings,
    colorMap,
}: Props) {
    const diagram = automaton.makeDiagram(
        initialConfiguration,
        settings.nbSteps
    );
    if (settings.timeGoesUp) {
        diagram.reverse();
    }

    return (
        <div>
            <Heading level={2}>Diagram</Heading>
            <div className="flex flex-col justify-center w-full align-middle">
                {diagram.map((config, row) => (
                    <Config1DComponent
                        key={row}
                        config={config}
                        hiddenSignalsSet={hiddenSignalsSet}
                        colorMap={colorMap}
                    />
                ))}
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
            {[...config.iter()].map((c) => {
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
