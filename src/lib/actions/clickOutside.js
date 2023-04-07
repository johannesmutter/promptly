export function clickOutside(node, { enabled = true, callback }) {
    function handleClick(event) {
        if (enabled && !node.contains(event.target)) {
            callback(event);
        }
    }

    document.addEventListener("click", handleClick);

    return {
        update({ enabled: newEnabled, callback: newCallback }) {
            enabled = newEnabled;
            callback = newCallback;
        },
        destroy() {
            document.removeEventListener("click", handleClick);
        },
    };
}