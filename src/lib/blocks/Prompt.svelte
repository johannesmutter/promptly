<script>
	import Icon from "$lib/Icon.svelte";
  import { blocks } from "$lib/stores/blocks";
  export let id = '';
  export let selected = false;
  console.log("updated")
</script>

<Icon src="message-spiral.svg" color="var(--yellow-dark)" />
<b>{@html $blocks[id].text}</b>

<style>
  b {
    font-weight: normal;
		color: var(--yellow-dark);
  }
</style>