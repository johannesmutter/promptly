<script>
	import { blocks } from "$lib/stores/blocks";
  export let id = '';
  export let selected = false;
</script>

<span>
  {@html $blocks[id].text}
</span>

<style>
  span {
    background-color: var(--yellow-lightest);
		color: var(--yellow-dark);
  }
</style>