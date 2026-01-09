import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function setsEqual<T>(a: Set<T>, b: Set<T>): boolean {
    return a.size === b.size && [...a].every((v) => b.has(v));
}
