<script>
	import { blocks, rootBlock } from "$lib/stores/blocks.js";
	import Editor from "$lib/Editor.svelte";
</script>

<div>
	<Editor expanded={true} parentID={$rootBlock} />
</div>

<style lang="postcss">
	div {
		padding: 20px;
	}
</style>