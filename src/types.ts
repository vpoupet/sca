import z from "zod";
import Vector from "./classes/Vector";
import type { Configuration } from "./classes/Configuration";

export type Signal = symbol;
export type DiagramCell = { signals: Set<Signal> };
export type Site = { pos: Vector; time: number };
export type ExtendedConfiguration = Configuration[]; // A configuration and its computed states at future times
export type IndexedConfiguration = { 
    time: number;
    configuration: ExtendedConfiguration;
};

export const configurationFileSchema = z.object({
    version: z.string().optional(),
    size: z.array(z.number()).min(1),
    signals: z.record(z.string(), z.array(z.string())),
});

export const settingsSchema = z.object({
    dimension: z.union([z.literal(1), z.literal(2)]),
    gridRadius: z.number().min(1).max(10),
    gridFutureSteps: z.number().min(1).max(10),
    nbCells: z.number().min(1),
    nbSteps: z.number().min(1),
    timeGoesUp: z.boolean(),
});

export type SettingsType = z.infer<typeof settingsSchema>;
