import RuleGrid from "@/classes/RuleGrid";
import { ArrowDownToDot, Trash2 } from "lucide-react";
import type { Signal } from "../types";
import GridComponent from "./GridComponent";
import { Button } from "./ui/button";

interface RuleGridComponentProps {
    ruleGrid: RuleGrid;
    colorMap: Map<Signal, string>;
    setGrid: (grid: RuleGrid) => void;
    onDelete: () => void;
    onReplace: () => void;
}

export default function RuleGridComponent(props: RuleGridComponentProps) {
    const { ruleGrid, colorMap, setGrid, onDelete, onReplace } = props;
    return (
        <div className="flex flex-col gap-4 p-4 bg-gray-100 border border-gray-300 shadoow-md">
            <GridComponent
                ruleGrid={ruleGrid}
                onClickGrid={() => {setGrid(ruleGrid.clone());}}
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
