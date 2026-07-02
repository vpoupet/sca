import { Configuration } from "../classes/Configuration";
import type { Signal } from "../types";
import CellComponent from "./CellComponent";

interface Props {
    config: Configuration;
    hiddenSignalsSet?: Set<Signal>;
    colorMap: Map<Signal, string>;
}

export function Config1DComponent({
    config,
    hiddenSignalsSet,
    colorMap,
}: Props) {
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
