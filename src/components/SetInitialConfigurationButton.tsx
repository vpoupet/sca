import { Configuration } from "@/classes/Configuration";
import { configurationFileSchema } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type Dispatch, type SetStateAction } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { Button } from "./ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import { Field, FieldError, FieldGroup } from "./ui/field";
import { Textarea } from "./ui/textarea";
import { randomColor } from "@/style/materialColors";

const formSchema = z.object({
    textInput: z.string().min(1, "Configuration text is required"),
});

type Props = {
    setInitialConfiguration: (config: Configuration) => void;
    setColorMap: Dispatch<SetStateAction<Map<symbol, string>>>;
};

export default function SetInitialConfigurationButton(props: Props) {
    const { setInitialConfiguration, setColorMap } = props;
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const form = useForm({
        defaultValues: {
            textInput: "",
        },
        resolver: zodResolver(formSchema),
    });

    function onSubmit(data: z.infer<typeof formSchema>) {
        try {
            const parsedData = configurationFileSchema.parse(
                JSON.parse(data.textInput)
            );
            console.log("Parsed data:", parsedData);
            const config = Configuration.fromJSON(parsedData);
            setColorMap((prevMap) => {
                const newMap = new Map(prevMap);
                const missingSignals = Array.from(config.getSignals()).filter(
                    (s) => !newMap.has(s)
                );
                for (const signal of missingSignals) {
                    newMap.set(signal, randomColor());
                }
                return newMap;
            });
            setInitialConfiguration(config);
            console.log("Initial configuration set:", config);
            setIsDialogOpen(false);
            form.reset();
        } catch (error) {
            alert("Failed to parse configuration: " + (error as Error).message);
            return;
        }
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button>Set Initial Configuration</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Set initial configuration</DialogTitle>
                    <DialogDescription className="hidden"></DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>
                        <Controller
                            name="textInput"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <Textarea
                                        className="h-48 resize-none"
                                        placeholder="Enter configuration text here..."
                                        {...field}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                </Field>
                            )}
                        />
                    </FieldGroup>
                    <div className="flex justify-end gap-1 mt-2">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => {
                                setIsDialogOpen(false);
                                form.reset();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">Submit</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
