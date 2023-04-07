<script>
	import Icon from "$lib/Icon.svelte";
  import { blocks } from "$lib/stores/blocks";
  export let id = '';
  export let selected = false;
</script>

<b>{@html $blocks[id].text}</b>

<Icon src="message-spiral.svg" color="var(--yellow-dark)" />

<style>
  b {
    font-weight: normal;
    background-color: var(--yellow-lightest);
		color: var(--yellow-dark);
  }
</style>