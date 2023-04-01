<script>
	import { blocks, rootBlock } from "$lib/stores/blocks.js";
	import Editor from "$lib/Editor.svelte";
</script>

<Editor parentID={$rootBlock} />