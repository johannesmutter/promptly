<script lang="ts">
	import { blocks, rootBlock } from "$lib/stores/blocks.js";
	import Editor from "$lib/Editor.svelte";
	import { enhance, type SubmitFunction } from '$app/forms';
	// import { supabaseClient } from '$lib/supabase';
	import type { PageData } from './$types';
	export let data: PageData;


	const submitLogout: SubmitFunction = async (event) => {

		console.log("logout",event)

		// const { error } = await supabaseClient.auth.signOut();
		// if (error) {
		// 	console.log(error);
		// }
		// cancel();
	};
</script>

<header>
	{#if data.session}
		<form action="/logout" method="POST" use:enhance={submitLogout}>
			<button type="submit">Logout</button>
		</form>
	{:else}
		<a href="/otlogin" >login</a>
	{/if}			
</header>


<div>
	{#if data.session}
		<Editor expanded={true} parentID={$rootBlock} />
	{/if}
</div>

<style>
	div {
		padding: 20px;
	}
</style>