export function pressEsc(node, { enabled = true, callback }) {
    function handleKeyDown(event) {
        if (enabled && event.key === "Escape") {
            callback(event);
        }
    }

    document.addEventListener("keydown", handleKeyDown);

    return {
        update({ enabled: newEnabled, callback: newCallback }) {
            enabled = newEnabled;
            callback = newCallback;
        },
        destroy() {
            document.removeEventListener("keydown", handleKeyDown);
        },
    };
}
