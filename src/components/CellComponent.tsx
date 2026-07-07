import { TooltipTrigger } from "@radix-ui/react-tooltip";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import Cell from "../classes/Cell";
import type { Signal } from "../types";
import { TooltipContent, TooltipProvider } from "./ui/tooltip";
import SignalName from "./SignalName";

interface CellComponentProps {
    cell: Cell;
    onClick?: (event: React.MouseEvent) => void;
    isActive?: boolean;
    hiddenSignalsSet?: Set<Signal>;
    colorMap: Map<Signal, string>;
    className?: string;
}

export default function CellComponent(props: CellComponentProps) {
    const {
        cell,
        onClick,
        isActive,
        hiddenSignalsSet = new Set(),
        colorMap,
        className = "",
    } = props;
    const signals = [...cell.signals].filter((s) => !hiddenSignalsSet.has(s));
    const negatedSignals = [...cell.negatedSignals].filter(
        (s) => !hiddenSignalsSet.has(s),
    );

    if (signals.length === 0 && negatedSignals.length === 0) {
        return (
            <div
                className={`cell aspect-square flex-1 border-gray-200 border ${
                    isActive ? "bg-gray-300" : "bg-white"
                } ${className}`}
                onClick={onClick}
            ></div>
        );
    }

    return (
        <TooltipProvider disableHoverableContent>
            <TooltipPrimitive.Root>
            <TooltipTrigger asChild>
                <div
                    className={`cell aspect-square flex-1 border-gray-200 border overflow-hidden ${
                        isActive ? "bg-gray-300" : "bg-white"
                    } ${className}`}
                    onClick={onClick}
                >
                    {signals
                        .map((signal) => {
                            return (
                                <div
                                    key={Symbol.keyFor(signal)}
                                    style={{
                                        backgroundColor:
                                            colorMap.get(signal) ?? "#000",
                                    }}
                                    className="st"
                                />
                            );
                        })}
                    {negatedSignals.map((signal) => {
                        return (
                            <div
                                key={"!" + Symbol.keyFor(signal)}
                                style={{
                                    backgroundColor:
                                        colorMap.get(signal) ?? "#000",
                                }}
                                className="st neg"
                            />
                        );
                    })}
                </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-96 w-fit flex flex-wrap gap-1">
                {signals.map((signal) => (
                    <SignalName
                        key={signal.description}
                        signal={signal}
                        colorMap={colorMap}
                    />
                ))}
                {negatedSignals.map((signal) => (
                    <SignalName
                        key={"!" + signal.description}
                        signal={signal}
                        colorMap={colorMap}
                        isNegated={true}
                    />
                ))}
            </TooltipContent>
            </TooltipPrimitive.Root>
        </TooltipProvider>
    );
}
