import z from "zod";
import Vector from "./classes/Vector";

export type Signal = symbol;
export type DiagramCell = { signals: Set<Signal> };
export type Site = { pos: Vector; time: number };

export const settingsSchema = z.object({
    dimension: z.union([z.literal(1), z.literal(2)]),
    gridRadius: z.number().min(1).max(10),
    gridFutureSteps: z.number().min(1).max(10),
    nbCells: z.number().min(1),
    nbSteps: z.number().min(1),
    timeGoesUp: z.boolean(),
});

export type SettingsType = z.infer<typeof settingsSchema>;
