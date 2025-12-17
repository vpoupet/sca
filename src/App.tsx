import { useState } from "react";
import SettingsComponent from "./components/SettingsComponent";
import Heading from "./components/Typography";
import type { SettingsType } from "./types";

const defaultSettings: SettingsType = {
    dimension: 1,
    gridRadius: 2,
    gridFutureSteps: 3,
    nbCells: 40,
    nbSteps: 60,
    timeGoesUp: true,
};

export default function App() {
    const [settings, setSettings] = useState(defaultSettings);

    return (
        <div className="flex flex-col w-screen min-h-screen p-2 text-gray-700 bg-linear-to-b from-slate-50 to-slate-100">
            <Heading level={1}>Signal-based cellular automata</Heading>
            <SettingsComponent
                settings={settings}
                setSettings={setSettings}
            />
        </div>
    );
}
