import { Configuration } from "../classes/Configuration";
import RuleGrid from "../classes/RuleGrid";
import Vector from "../classes/Vector";
import type { Signal, Site } from "../types";
import CellComponent from "./CellComponent";

interface GridComponentProps {
    inputCells: Configuration;
    outputCells: Configuration[];
    colorMap: Map<Signal, string>;
    onClickGrid?: () => void;
    activeCellsManager?: {
        activeInputCells: Vector[];
        activeOutputCells: Site[];
        setActiveInputCells: (input: Vector[]) => void;
        setActiveOutputCells: (output: Site[]) => void;
    };
}

export default function GridComponent(props: GridComponentProps) {
    const {
        inputCells,
        outputCells,
        colorMap,
        onClickGrid,
        activeCellsManager,
    } = props;
    const grid = new RuleGrid(inputCells, outputCells);

    function handleClickOutputCell(
        time: number,
        pos: Vector,
        event: React.MouseEvent
    ) {
        if (activeCellsManager === undefined) {
            return;
        }

        const { activeOutputCells, setActiveInputCells, setActiveOutputCells } =
            activeCellsManager;

        if (event.ctrlKey || event.metaKey) {
            if (
                activeOutputCells.some(
                    (coords) => coords.time === time && coords.pos.equals(pos)
                )
            ) {
                setActiveOutputCells(
                    activeOutputCells.filter(
                        (coords) =>
                            coords.time !== time || !coords.pos.equals(pos)
                    )
                );
            } else {
                setActiveOutputCells([...activeOutputCells, { time, pos }]);
            }
        } else {
            setActiveInputCells([]);
            setActiveOutputCells([{ time, pos }]);
        }
    }

    function handleClickInputCell(pos: Vector, event: React.MouseEvent) {
        if (activeCellsManager === undefined) {
            return;
        }

        const { activeInputCells, setActiveInputCells, setActiveOutputCells } =
            activeCellsManager;

        if (event.ctrlKey || event.metaKey) {
            if (activeInputCells.some((input) => input.equals(pos))) {
                setActiveInputCells(
                    activeInputCells.filter((i) => !i.equals(pos))
                );
            } else {
                setActiveInputCells([...activeInputCells, pos]);
            }
        } else {
            setActiveInputCells([pos]);
            setActiveOutputCells([]);
        }
    }

    return (
        <div
            className="flex flex-col items-center cursor-pointer"
            onClick={onClickGrid}
        >
            <div className="flex flex-col-reverse mb-1">
                {grid.outputCells.map((config, time) => (
                    <div key={time} className="flex flex-row">
                        {Array.from(config.iter(), (pos) => (
                            <CellComponent
                                key={`${time + 1}-${pos.at(0)}`}
                                cell={config.getCellAt(pos)!}
                                isActive={
                                    activeCellsManager &&
                                    activeCellsManager.activeOutputCells.some(
                                        (coordinates) =>
                                            coordinates.time === time &&
                                            coordinates.pos.equals(pos)
                                    )
                                }
                                hiddenSignalsSet={new Set()}
                                onClick={(event) =>
                                    handleClickOutputCell(time, pos, event)
                                }
                                colorMap={colorMap}
                            />
                        ))}
                    </div>
                ))}
            </div>
            <div className="flex flex-row">
                {Array.from(grid.inputCells.iter(), (pos) => {
                    const cell = grid.inputCells.getCellAt(pos)!;
                    return (
                        <CellComponent
                            key={`0-${pos.at(0)}`}
                            cell={cell}
                            isActive={
                                activeCellsManager &&
                                activeCellsManager.activeInputCells.some(
                                    (c) => c.equals(pos)
                                )
                            }
                            hiddenSignalsSet={new Set()}
                            onClick={(event) =>
                                handleClickInputCell(pos, event)
                            }
                            colorMap={colorMap}
                        />
                    );
                })}
            </div>
        </div>
    );
}
