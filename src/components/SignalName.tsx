import type { Signal } from "../types";

interface SignalNameProps {
    signal: Signal;
    isNegated?: boolean;
    colorMap: Map<Signal, string>;
    onClickColor?: () => void;
    className?: string;
}

export default function SignalName(props: SignalNameProps) {
    const { signal, colorMap, onClickColor, className } = props;
    const color = colorMap.get(signal) ?? "black";

    return (
        <div
            className={`inline-flex border-2 rounded-full px-1 shadow-sm mr-2 ${className}`}
            style={{ borderColor: color }}
        >
            <div
                className={`relative top-[.2em] w-[1em] h-[1em] rounded-full mr-1 ${
                    onClickColor ? "cursor-pointer" : ""
                }`}
                style={{ backgroundColor: color }}
                onClick={onClickColor}
            />
            {props.isNegated ? "!" : ""}
            {signal.description}
        </div>
    );
}
