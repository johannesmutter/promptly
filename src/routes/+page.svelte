<script>
	import { blocks } from "$lib/stores.js";
	import Editor from "$lib/Editor.svelte";
</script>

<Editor {blocks} />

<!-- Debugging -->
<pre>
{JSON.stringify($blocks,null,2)}
</pre>
