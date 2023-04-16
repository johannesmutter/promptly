<script lang="ts">
	import { blocks, rootBlock } from "$lib/stores/blocks.js";
	import Editor from "$lib/Editor.svelte";
	import { enhance, type SubmitFunction } from '$app/forms';
	// import { supabaseClient } from '$lib/supabase';
	import type { PageData } from './$types';
	export let data: PageData;
	import { onMount } from 'svelte';
	import Icon from '$lib/Icon.svelte'

	import { supabase } from "$lib/supabaseClient";
	let userid =data.session.user.id;


	let blockslist=[]
	export async function load() {
  const { data } = await supabase.from("prompts").select();
  return data
}


	const submitLogout: SubmitFunction = async (event) => {

		console.log("logout",event)

		// const { error } = await supabaseClient.auth.signOut();
		// if (error) {
		// 	console.log(error);
		// }
		// cancel();
	};

	export async function savePrompt(user){

		const { data, error } = await supabase
  .from('prompts')
  .upsert({ user_id: user, prompt: $blocks?.[$rootBlock], id: $rootBlock})
	}

	
	onMount(async () => {
		blockslist = await load()
  console.log(blockslist)
})

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


<section>
	{#each blockslist as b}

<div>
	
	<p><Icon src="message-spiral.svg" color="var(--violet-dark)" /> {b.prompt.text}</p>
	
</div>
	
	{/each}
</section>
	<Editor expanded={true} parentID={$rootBlock} />
	<button on:click={() => savePrompt(userid)}>Save Prompt</button>

		
	{:else}

	<Editor expanded={true} parentID={$rootBlock} />
	
	{/if}
</div>

<style>
	div {
		padding: 20px;
	}
</style>