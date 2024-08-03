import React from "react";
import ReactDOM from "react-dom";
import { createPlugin } from "react-plugin";
import { AxeButton } from "./AxeButton";

const { namedPlug, register } = createPlugin({
    name: "axe",
});

namedPlug("rendererAction", "axe", ({ pluginContext, slotProps }) => {
    const { getMethodsOf } = pluginContext;
    const core = getMethodsOf("core");
    const devServerOn = core.isDevServerOn();
    const onAxe = useAxe(pluginContext, slotProps.fixtureId, devServerOn);

    useEffect(() => {
        return core.registerCommands({ axe: onAxe });
    }, [core, onAxe]);

    if (!devServerOn) return null;
    return <AxeButton onClick={onAxe} />;
});
export { register };

const useAxe = (context, fixtureId, devServerOn) => {
    const onError = useErrorNotification(context);
    return useCallback(() => {
        if (!devServerOn) return onError("Static exports cannot access source files.");

        try {
            import("@axe-core/react").then((axe) => {
                axe(React, ReactDOM, 1000);
            });
        } catch (error) {
            onError(error.message);
        }
    }, [fixtureId.path, onError, devServerOn]);
};

function useErrorNotification(context) {
    const { getMethodsOf } = context;
    const notifications = getMethodsOf("notifications");
    const { pushTimedNotification } = notifications;
    return useCallback(
        (info) =>
            pushTimedNotification({
                id: "axe",
                type: "error",
                title: "Failed to axe properly",
                info,
            }),
        [pushTimedNotification]
    );
}
