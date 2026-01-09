import { Eraser } from "lucide-react";
import Automaton from "../classes/Automaton.ts";
import Cell from "../classes/Cell.ts";
import { Configuration1D } from "../classes/Configuration.ts";
import RuleGrid from "../classes/RuleGrid.ts";
import Vector from "../classes/Vector.ts";
import "../style/Cell.scss";
import type { SettingsType, Signal, Site } from "../types.ts";
import GridComponent from "./GridComponent.tsx";
import GridSignalsManager from "./GridSignalsManager.tsx";
import { Button } from "./ui/button.tsx";

type EditGridProps = {
    grid: RuleGrid;
    setGrid: (grid: RuleGrid) => void;
    settings: SettingsType;
    automaton: Automaton;
    setAutomaton: (automaton: Automaton) => void;
    extraSignalsSet: Set<Signal>;
    activeInputCells: Vector[];
    setActiveInputCells: (activeInputCells: Vector[]) => void;
    activeOutputCells: Site[];
    setActiveOutputCells: (activeOutputCells: Site[]) => void;
    colorMap: Map<Signal, string>;
};

export default function EditGrid(props: EditGridProps) {
    const {
        grid,
        setGrid,
        settings,
        automaton,
        setAutomaton,
        extraSignalsSet,
        activeInputCells,
        setActiveInputCells,
        activeOutputCells,
        setActiveOutputCells,
        colorMap,
    } = props;
    const signalsList = automaton.getSignalsList(extraSignalsSet);

    function applyToActiveCells(f: (cell: Cell) => void) {
        const newGrid = grid.clone();
        activeInputCells.forEach((pos) => {
            const cell = newGrid.inputCells.getCellAt(pos);
            if (cell) {
                f(cell);
            }
        });
        activeOutputCells.forEach(({ pos, time }) => {
            const cell = newGrid.outputCells[time].getCellAt(pos);
            if (cell) {
                f(cell);
            }
        });
        setGrid(newGrid);
    }

    function clearGrid() {
        const newGrid = RuleGrid.withSize(
            settings.gridRadius,
            settings.gridFutureSteps
        );
        setGrid(newGrid);
    }

    function clearInputs() {
        const newGrid = RuleGrid.withSize(
            settings.gridRadius,
            settings.gridFutureSteps
        );
        newGrid.outputCells = grid.outputCells;
        setGrid(newGrid);
    }

    function clearOutputs() {
        const newGrid = RuleGrid.withSize(
            settings.gridRadius,
            settings.gridFutureSteps
        );
        newGrid.inputCells = grid.inputCells;
        setGrid(newGrid);
    }

    function clearSelected() {
        applyToActiveCells((cell) => {
            cell.removeAllSignals();
        });
    }

    function saveGridAsRule() {
        function hasOutputs(): boolean {
            for (const row of grid.outputCells) {
                for (const pos of row.iter()) {
                    const cell = row.getCellAt(pos);
                    if (cell!.signals.size > 0) {
                        return true;
                    }
                }
            }
            return false;
        }

        if (hasOutputs()) {
            setAutomaton(automaton.addRules([grid.makeRule()]));
            clearGrid();
        } else {
            alert("Rule has no outputs");
        }
    }

    function applyRules(): RuleGrid {
        const configuration = new Configuration1D(
            Array.from(grid.inputCells.iter(), (c) =>
                grid.inputCells.getCellAt(c)!.clone()
            )
        );
        const diagram = [configuration];
        while (diagram.length < settings.gridFutureSteps + 1) {
            diagram.push(
                Configuration1D.withSize(
                    new Vector([2 * settings.gridRadius + 1])
                )
            );
        }
        automaton.applyRulesOnDiagram(diagram, 0);
        return new RuleGrid(grid.inputCells, diagram.slice(1));
    }

    // TODO: re-implement fitting rules
    function fitRules() {
        // const context = automaton.getEvalContext();
        // const newRules: Rule[] = [];
        // for (const rule of automaton.rules) {
        //     newRules.push(...rule.fitTarget(grid, context));
        // }
        // const currentGrid = applyRules();
        // const gridRadius = grid.getRadius();
        // const addedOutputs: RuleOutput[] = [];
        // for (let t = 0; t < grid.outputCells.length; t++) {
        //     for (let c = 0; c < grid.outputCells[t].length; c++) {
        //         for (const s of grid.outputCells[t][c].signals) {
        //             if (!currentGrid.outputCells[t][c].signals.has(s)) {
        //                 addedOutputs.push(
        //                     new RuleOutput(c - gridRadius, s, t + 1)
        //                 );
        //             }
        //         }
        //     }
        // }
        // if (addedOutputs.length > 0) {
        //     newRules.push(new Rule(grid.makeRuleCondition(true), addedOutputs));
        // }
        // setAutomaton(new Automaton(newRules, automaton.multiSignals));
        // clearGrid();
    }

    // Make list of active and negated signals on the active cells
    const activeSignals: Set<Signal> = new Set();
    const negatedSignals: Set<Signal> = new Set();
    activeInputCells.forEach((pos) => {
        const cell = grid.inputCells.getCellAt(pos);
        if (cell) {
            cell.signals.forEach((signal) => {
                activeSignals.add(signal);
            });
            cell.negatedSignals.forEach((signal) => {
                negatedSignals.add(signal);
            });
        }
    });
    activeOutputCells.forEach((site) => {
        const cell = grid.outputCells[site.time].getCellAt(site.pos);
        if (cell) {
            cell.signals.forEach((signal) => {
                activeSignals.add(signal);
            });
        }
    });

    return (
        <div className="flex flex-col items-center gap-4 p-2 bg-white border border-gray-300 shadow-md">
            <div className="flex flex-col items-center gap-2 p-2 bg-gray-100 border border-gray-300 shadow-md w-fit">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col w-32 gap-2">
                        <Button variant="outline" onClick={clearOutputs}>
                            <span className="flex items-center gap-1">
                                <Eraser /> outputs
                            </span>
                        </Button>
                        <Button variant="outline" onClick={clearGrid}>
                            <span className="flex items-center gap-1">
                                <Eraser /> grid
                            </span>
                        </Button>
                        <Button variant="outline" onClick={clearInputs}>
                            <span className="flex items-center gap-1">
                                <Eraser /> inputs
                            </span>
                        </Button>
                    </div>
                    <GridComponent
                        inputCells={grid.inputCells}
                        outputCells={grid.outputCells}
                        colorMap={colorMap}
                        activeCellsManager={{
                            activeInputCells,
                            setActiveInputCells,
                            activeOutputCells,
                            setActiveOutputCells,
                        }}
                    />
                    <div className="flex flex-col w-32 gap-2">
                        <Button onClick={() => setGrid(applyRules())}>
                            Apply rules
                        </Button>
                    </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="flex gap-2">
                        <Button onClick={saveGridAsRule}>Add rule</Button>
                        {/* TODO: reactivate button */}
                        <Button onClick={fitRules} disabled>
                            Fit rules
                        </Button>
                    </div>
                    <Button variant="outline" onClick={clearSelected}>
                        <Eraser /> selected
                    </Button>
                </div>
            </div>
            <GridSignalsManager
                activeSignals={activeSignals}
                negatedSignals={negatedSignals}
                allSignals={signalsList}
                applyToActiveCells={applyToActiveCells}
                colorMap={colorMap}
            />
        </div>
    );
}
