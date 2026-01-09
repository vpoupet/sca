import { materialColors } from "../style/materialColors.ts";
import { Button } from "./ui/button.tsx";

interface MaterialColorPickerProps {
    chooseColor: (color: string) => void;
    closeColorPicker: () => void;
}

export default function MaterialColorPicker(props: MaterialColorPickerProps) {
    const { chooseColor, closeColorPicker } = props;

    return (
        <div className="absolute left-full p-1 bg-white border rounded-sm shadow-sm mr-2">
            <div className="flex flex-row">
                {Object.entries(materialColors).map(
                    ([colorName, colorShades]) => (
                        <div key={colorName} className="flex flex-col">
                            {Object.entries(colorShades).map(
                                ([shadeName, shadeValue]) => (
                                    <div
                                        key={shadeName}
                                        className="h-4 w-4"
                                        onClick={() => {
                                            chooseColor(shadeValue);
                                        }}
                                        style={{
                                            backgroundColor: shadeValue,
                                        }}
                                    ></div>
                                )
                            )}
                        </div>
                    )
                )}
            </div>
            <Button onClick={closeColorPicker}>X</Button>
        </div>
    );
}
