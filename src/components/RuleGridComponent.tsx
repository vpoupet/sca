import { ArrowDownToDot, Trash2 } from "lucide-react";
import { Configuration } from "../classes/Configuration";
import RuleGrid from "../classes/RuleGrid";
import type { Signal } from "../types";
import GridComponent from "./GridComponent";
import { Button } from "./ui/button";

interface RuleGridComponentProps {
    inputCells: Configuration;
    outputCells: Configuration[];
    colorMap: Map<Signal, string>;
    setGrid: (grid: RuleGrid) => void;
    onDelete: () => void;
    onReplace: () => void;
}

export default function RuleGridComponent(props: RuleGridComponentProps) {
    const { inputCells, outputCells, colorMap, setGrid, onDelete, onReplace } = props;
    return (
        <div className="flex flex-col gap-4 p-4 bg-gray-100 border border-gray-300 shadoow-md">
            <GridComponent
                inputCells={inputCells}
                outputCells={outputCells}
                onClickGrid={() => {setGrid(new RuleGrid(inputCells, outputCells));}}
                colorMap={colorMap}
            />
            <div className="flex justify-center gap-2">
                <Button variant="destructive" onClick={onDelete}>
                    <Trash2 />
                </Button>
                <Button variant="outline" onClick={onReplace}>
                    <ArrowDownToDot />
                </Button>
            </div>
        </div>
    );
}
