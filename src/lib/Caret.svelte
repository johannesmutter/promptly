<script>
export let 
  /** @type {number }*/
  left = 0,
  /** @type {number }*/
  top = 0,
  /** @type {number }*/
  height = 20;
</script>

<span 
  class="caret" 
  style:left="{left}px"
  style:top="{top}px"
  style:height="{height}px"
></span>

<style>
  .caret {
		width: 2px;
		height: 100%;
		background-color: var(--blue-base);
		position: absolute;
		pointer-events: none;
		left: 0;
		top: 0;
		opacity: 1;
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

