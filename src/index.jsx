import axe from "@axe-core/react";
import React from "react";
import ReactDOM from "react-dom";
import { createPlugin } from "react-plugin";
import { AxeButton } from "./AxeButton";

const PLUGIN_NAME = "axePlugin";

const { namedPlug, register, onLoad } = createPlugin({ name: PLUGIN_NAME });

onLoad((context) => {
    console.info(`Plugin ${PLUGIN_NAME} loaded`, context);
});

namedPlug("rendererAction", PLUGIN_NAME, ({ pluginContext, slotProps }) => {
    console.log("rendererAction", pluginContext, slotProps);
    const { getMethodsOf } = pluginContext;
    const core = getMethodsOf("core");
    const devServerOn = core.isDevServerOn();
    const onAxe = useAxe(pluginContext, slotProps.fixtureId, devServerOn);

    useEffect(() => {
        console.log("effect");
        return core.registerCommands({ [PLUGIN_NAME]: onAxe });
    }, [core, onAxe]);

    if (!devServerOn) return null;
    return <AxeButton onClick={onAxe} />;
});

export { register };

if (process.env.NODE_ENV !== "test") {
    console.info(`Register plugin ${PLUGIN_NAME}`);
    register();
}

const useAxe = (context, fixtureId, devServerOn) => {
    const onError = useErrorNotification(context);
    return useCallback(() => {
        if (!devServerOn) return onError("Static exports cannot access source files.");

        try {
            axe(React, ReactDOM, 1000);
        } catch (error) {
            onError(error.message);
        }
    }, [fixtureId.path, onError, devServerOn]);
};

const useErrorNotification = (context) => {
    const { getMethodsOf } = context;
    const notifications = getMethodsOf("notifications");
    const { pushTimedNotification } = notifications;
    return useCallback(
        (info) =>
            pushTimedNotification({
                id: PLUGIN_NAME,
                type: "error",
                title: "Can't even axe!",
                info,
            }),
        [pushTimedNotification]
    );
};
