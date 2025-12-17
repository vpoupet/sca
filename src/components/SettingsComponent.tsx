import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { Cog } from "lucide-react";
import { useState, type ReactElement } from "react";
import { useForm } from "react-hook-form";
import { settingsSchema, type SettingsType } from "../types";
import { Button } from "./ui/button";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSeparator,
    FieldSet,
} from "./ui/field";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";

interface SettingsComponentProps {
    settings: SettingsType;
    setSettings: (settings: SettingsType) => void;
}

export default function SettingsComponent(
    props: SettingsComponentProps
): ReactElement {
    const { settings, setSettings } = props;
    const [isOpen, setIsOpen] = useState(false);
    const form = useForm<SettingsType>({
        resolver: zodResolver(settingsSchema),
        defaultValues: settings,
    });

    function onSubmit(values: SettingsType) {
        setSettings(values);
        setIsOpen(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="absolute cursor-pointer top-4 right-4">
                    <Cog /> Settings
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="">
                    <DialogHeader className="mb-4">
                        <DialogTitle>Settings</DialogTitle>
                        <DialogDescription>
                            Configure the automaton parameters below.
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        {/* Dimension */}
                        <FieldSet>
                            <FieldLegend>General</FieldLegend>
                            <FieldSet>
                                <div className="flex gap-4">
                                    <FieldLabel htmlFor="dimension">
                                        Dimension
                                    </FieldLabel>
                                    <RadioGroup
                                        id="dimension"
                                        defaultValue={form
                                            .getValues("dimension")
                                            .toString()}
                                        onValueChange={(value) => {
                                            form.setValue(
                                                "dimension",
                                                value === "2" ? 2 : 1
                                            );
                                        }}
                                        className="flex gap-4"
                                    >
                                        <div className="flex gap-1 items-center">
                                            <RadioGroupItem
                                                value="1"
                                                id="dimension-1"
                                            />
                                            <label htmlFor="dimension-1">1</label>
                                        </div>
                                        <div className="flex gap-1 items-center">
                                            <RadioGroupItem
                                                value="2"
                                                id="dimension-2"
                                            />
                                            <label htmlFor="dimension-2">2</label>
                                        </div>
                                    </RadioGroup>
                                </div>
                                <FieldError>
                                    {form.formState.errors.dimension?.message}
                                </FieldError>
                            </FieldSet>
                        </FieldSet>
                        <FieldSeparator />
                        {/* Edit Grid */}
                        <FieldSet>
                            <FieldLegend>Edit Grid</FieldLegend>
                            <Field>
                                <div className="flex gap-4">
                                    <FieldLabel htmlFor="gridRadius">Radius</FieldLabel>
                                    <Input
                                        id="gridRadius"
                                        type="number"
                                        min={1}
                                        max={10}
                                        {...form.register("gridRadius", {
                                            valueAsNumber: true,
                                        })}
                                        className="w-24"
                                    />
                                </div>
                                <FieldError>
                                    {form.formState.errors.gridRadius?.message}
                                </FieldError>
                            </Field>
                            <Field>
                                <div className="flex gap-4">
                                    <FieldLabel htmlFor="gridFutureSteps">
                                        Nb Future Steps
                                    </FieldLabel>
                                    <Input
                                        id="gridFutureSteps"
                                        type="number"
                                        min={1}
                                        max={10}
                                        {...form.register("gridFutureSteps", {
                                            valueAsNumber: true,
                                        })}
                                        className="w-24"
                                    />
                                </div>
                                <FieldError>
                                    {form.formState.errors.gridFutureSteps?.message}
                                </FieldError>
                            </Field>
                        </FieldSet>
                        <FieldSeparator />
                        {/* Diagram */}
                        <FieldSet>
                            <FieldLegend>Diagram</FieldLegend>
                            <Field>
                                <div className="flex gap-4">
                                    <FieldLabel htmlFor="nbCells">
                                        Number of Cells
                                    </FieldLabel>
                                    <Input
                                        id="nbCells"
                                        type="number"
                                        min={1}
                                        {...form.register("nbCells", {
                                            valueAsNumber: true,
                                        })}
                                        className="w-24"
                                    />
                                </div>
                                <FieldError>
                                    {form.formState.errors.nbCells?.message}
                                </FieldError>
                            </Field>
                            <Field>
                                <div className="flex gap-4">
                                    <FieldLabel htmlFor="nbSteps">
                                        Number of Steps
                                    </FieldLabel>
                                    <Input
                                        id="nbSteps"
                                        type="number"
                                        min={1}
                                        {...form.register("nbSteps", {
                                            valueAsNumber: true,
                                        })}
                                        className="w-24"
                                    />
                                </div>
                                <FieldError>
                                    {form.formState.errors.nbSteps?.message}
                                </FieldError>
                            </Field>
                            <Field>
                                <div className="flex gap-4">
                                    <FieldLabel htmlFor="timeGoesUp">
                                        Time Goes Up
                                    </FieldLabel>
                                    <Checkbox
                                        id="timeGoesUp"
                                        {...form.register("timeGoesUp")}
                                    />
                                </div>
                                <FieldError>
                                    {form.formState.errors.timeGoesUp?.message}
                                </FieldError>
                            </Field>
                        </FieldSet>
                    </FieldGroup>
                    <DialogFooter>
                        <Button type="submit">Save</Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                form.reset(settings);
                                setIsOpen(false);
                            }}
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
