import { type ChangeEvent } from "react";
import Cell from "../classes/Cell";
import type { Signal } from "../types";
import SignalName from "./SignalName";

type GridSignalsManagerProps = {
    activeSignals: Set<Signal>;
    negatedSignals: Set<Signal>;
    allSignals: Signal[];
    applyToActiveCells: (f: (cell: Cell) => void) => void;
    colorMap: Map<Signal, string>;
};

export default function GridSignalsManager({
    activeSignals,
    negatedSignals,
    allSignals,
    applyToActiveCells,
    colorMap,
}: GridSignalsManagerProps) {
    function handleLeftCheckboxChange(
        signal: Signal,
        e: ChangeEvent<HTMLInputElement>
    ) {
        if (e.target.checked) {
            applyToActiveCells((c: Cell) => c.addSignal(signal));
        } else {
            applyToActiveCells((c: Cell) => c.removeSignal(signal));
        }
    }

    function handleRightCheckboxChange(
        signal: Signal,
        e: ChangeEvent<HTMLInputElement>
    ) {
        if (e.target.checked) {
            applyToActiveCells((c: Cell) => c.addNegatedSignal(signal));
        } else {
            applyToActiveCells((c: Cell) => c.removeNegatedSignal(signal));
        }
    }

    return (
        <div className="columns-2 gap-4 w-full">
            {allSignals.map((signal) => (
                <div
                    key={Symbol.keyFor(signal)}
                    className="inline-block w-full break-inside-avoid"
                >
                    <div className="flex gap-1">
                        <input
                            type="checkbox"
                            checked={activeSignals.has(signal)}
                            onChange={(e) =>
                                handleLeftCheckboxChange(signal, e)
                            }
                        />
                        <input
                            type="checkbox"
                            checked={negatedSignals.has(signal)}
                            onChange={(e) =>
                                handleRightCheckboxChange(signal, e)
                            }
                        />
                        <SignalName signal={signal} colorMap={colorMap} />
                    </div>
                </div>
            ))}
        </div>
    );
}
