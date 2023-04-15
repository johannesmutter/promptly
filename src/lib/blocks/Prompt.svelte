<script>
	import Icon from "$lib/Icon.svelte";
  import { blocks } from "$lib/stores/blocks";
  export let id = '';
  export let selected = false;
</script>

<Icon src="bracket-left.svg" color="var(--violet-dark)" width={10} height={24} />
<b>{@html $blocks[id].text}</b>
<Icon src="bracket-right.svg" color="var(--violet-dark)" width={10} height={24} />


<style>
  b, span {
    font-weight: normal;
		color: var(--violet-dark);
  }
</style>