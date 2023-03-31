<script>
	import { blocks, rootBlock } from "$lib/stores/blocks.js";
	import Editor from "$lib/Editor.svelte";
</script>

<Editor blockID={$rootBlock} />

<!-- Debugging -->
<pre>
{JSON.stringify($blocks,null,2)}
</pre>
