export function pressArrowKeys(node, callback) {
	node.addEventListener("keydown", (event) => {
		if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
			event.preventDefault();
			callback(event.key);
		}
	});

	return {
		destroy() {
			node.removeEventListener("keydown", callback);
		},
	};
}
