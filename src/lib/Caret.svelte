<script>
	let 
	/** @type {number | undefined} */
	timeout, 
	/** @type {boolean} */
	caretIsBlinking = false, 
	/** @type {number} */
	previousLeft = 0,
	/** @type {number} */
	previousTop = 0;

export let
	/** @type {number} */
	left = 0,
	/** @type {number} */
	top = 0,
	/** @type {number} */
	height = 20;

// Only blink the cursor when 'top' or 'left' haven't changed for some time.
$: {
	if (previousLeft !== left || previousTop !== top) {
		clearTimeout(timeout);
		caretIsBlinking = false;
		timeout = setTimeout(() => {
			caretIsBlinking = true;
		}, 200);
		previousLeft = left;
		previousTop = top;
	}
}
</script>

<span
	class="caret {caretIsBlinking ? 'blinking' : ''}"
	style:left="{left}px"
	style:top="{top}px"
	style:height="{height}px"
></span>
	
<style>
	.caret {
		transition: left 100ms ease-in-out, top 100ms ease-in-out;
		width: 2px;
		height: 100%;
		background-color: var(--blue-base);
		position: absolute;
		pointer-events: none;
		left: 0;
		top: 0;
		opacity: 1;
	}

	.caret.blinking {
		animation: cursor-blink 800ms steps(10) infinite 800ms;
	}

	@keyframes cursor-blink {
	0% {
		opacity: 0;
	}
	50% {
		opacity: 1;
	}
	100% {
		opacity: 0;
	}
}
</style>
