<script>
export let
	/** @type {boolean} */
	active = false,
	/** @type {number} */
	left = 0,
	/** @type {number} */
	top = 0,
	/** @type {number} */
	height = 20;

let 
	/** @type {number | undefined} */
	timeout, 
	/** @type {boolean} */
	blinking = false, 
	/** @type {boolean} */
	transitionEnabled = false,
	/** @type {number} */
	previousLeft = 0,
	/** @type {number} */
	previousTop = 0;

// Only blink the cursor when 'top' or 'left' haven't changed for some time.
$: {
	if (previousLeft !== left || previousTop !== top) {
		clearTimeout(timeout);
		blinking = false;
		timeout = setTimeout(() => {
			blinking = true;
		}, 200);
		previousLeft = left;
		previousTop = top;
	}

	// only enable transitions when active has been active for a moment
	if (active) {
		setTimeout(() => {
			transitionEnabled = true;
		}, 60);
	} else {
		transitionEnabled = false;
	}
}

</script>

<span
	class="caret"
	class:active
	class:blinking
	class:transitionEnabled
	style:left="{left}px"
	style:top="{top}px"
	style:height="{height}px"
></span>
	
<style lang="postcss">
	.caret {
		width: 2px;
		height: 100%;
		background-color: var(--violet-base);
		position: absolute;
		pointer-events: none;
		left: 0;
		top: 0;
		opacity: 0;
		display: none;
		transition: none;
		&.active {
			display: block;
			opacity: 1;
		}
		&.transitionEnabled {
			transition: left 60ms ease-in, top 60ms ease-in;
		}
		&.blinking {
			animation: cursor-blink 800ms steps(10) infinite 800ms;
		}
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
