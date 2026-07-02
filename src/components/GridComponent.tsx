import RuleGrid from "../classes/RuleGrid";
import Vector from "../classes/Vector";
import type { Signal } from "../types";
import CellComponent from "./CellComponent";

interface GridComponentProps {
    ruleGrid: RuleGrid;
    colorMap: Map<Signal, string>;
    onClickGrid?: () => void;
    activeCellsManager?: {
        activeInputCells: Vector[];
        activeOutputCells: Vector[];
        setActiveInputCells: (input: Vector[]) => void;
        setActiveOutputCells: (output: Vector[]) => void;
    };
}

export default function GridComponent(props: GridComponentProps) {
    const { ruleGrid, colorMap, onClickGrid, activeCellsManager } = props;

    function handleClickOutputCell(pos: Vector, event: React.MouseEvent) {
        if (activeCellsManager === undefined) {
            return;
        }

        const { activeOutputCells, setActiveInputCells, setActiveOutputCells } =
            activeCellsManager;

        if (event.ctrlKey || event.metaKey) {
            if (activeOutputCells.some((p) => p.equals(pos))) {
                // deselect the clicked cell
                setActiveOutputCells(
                    activeOutputCells.filter((p) => !p.equals(pos)),
                );
            } else {
                // select the clicked cell
                setActiveOutputCells([...activeOutputCells, pos]);
            }
        } else {
            setActiveInputCells([]);
            setActiveOutputCells([pos]);
        }
    }

    function handleClickInputCell(pos: Vector, event: React.MouseEvent) {
        if (activeCellsManager === undefined) {
            return;
        }

        const { activeInputCells, setActiveInputCells, setActiveOutputCells } =
            activeCellsManager;

        if (event.ctrlKey || event.metaKey) {
            if (activeInputCells.some((p) => p.equals(pos))) {
                setActiveInputCells(
                    activeInputCells.filter((p) => !p.equals(pos)),
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
            <div className="flex flex-col gap-1">
                <div className="flex flex-row">
                    {Array.from(ruleGrid.outputCells.iterPositions(), (pos) => {
                        const cell = ruleGrid.outputCells.getCellAt(pos)!;
                        return (
                            <CellComponent
                                key={pos.toString()}
                                cell={cell}
                                isActive={
                                    activeCellsManager &&
                                    activeCellsManager.activeOutputCells.some(
                                        (p) => p.equals(pos),
                                    )
                                }
                                hiddenSignalsSet={new Set()}
                                onClick={(event) =>
                                    handleClickOutputCell(pos, event)
                                }
                                colorMap={colorMap}
                                className="w-6"
                            />
                        );
                    })}
                </div>
                <div className="flex flex-row">
                    {Array.from(ruleGrid.inputCells.iterPositions(), (pos) => {
                        const cell = ruleGrid.inputCells.getCellAt(pos)!;
                        return (
                            <CellComponent
                                key={pos.toString()}
                                cell={cell}
                                isActive={
                                    activeCellsManager &&
                                    activeCellsManager.activeInputCells.some(
                                        (p) => p.equals(pos),
                                    )
                                }
                                hiddenSignalsSet={new Set()}
                                onClick={(event) =>
                                    handleClickInputCell(pos, event)
                                }
                                colorMap={colorMap}
                                className="w-6"
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
