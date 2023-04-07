<script>
	import Icon from "$lib/Icon.svelte";
  import { blocks } from "$lib/stores/blocks";
  export let id = '';
  export let selected = false;
</script>

<q>
  {@html $blocks[id].text}
</q>

<Icon src="message-spiral.svg" color="var(--yellow-dark)" />

<style>
  q {
    background-color: var(--yellow-lightest);
		color: var(--yellow-dark);
  }
</style>