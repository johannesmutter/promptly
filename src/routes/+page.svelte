<script lang="ts">
	import { blocks, selectedBlockIDs } from '$lib/stores/blocks.js';
	import Editor from '$lib/Editor.svelte';
	import { enhance, type SubmitFunction } from '$app/forms';
	// import { supabaseClient } from '$lib/supabase';
	import type { PageData } from './$types';
	export let data: PageData;
	import { onMount } from 'svelte';
	import Icon from '$lib/Icon.svelte';
	import { supabase } from '$lib/supabaseClient';
	import NavPromptButton from '$lib/NavPromptButton.svelte';

	let userID = data?.session?.user?.id;

	// const publicUserID = '69dff67a-2ccb-4071-9bbe-fe32694a194a';
	const publicUserID = '717258fb-296e-47ca-bc14-712b56dda4da'; // for featured prompts

	let blocksFromDB = [];

	export async function load() {
		
		const { data } = await supabase
			.from('prompts')
			.select()
			.or(`${userID ? `user_id.eq.${userID},` : ''}user_id.eq.${publicUserID}`);
		return data;
	}

	const submitLogout: SubmitFunction = async (event) => {
		// console.log('logout', event);

		// const { error } = await supabaseClient.auth.signOut();
		// if (error) {
		// 	console.log(error);
		// }
		// cancel();
	};

	export async function savePrompt(userID: string) {
    const { data, error } = await supabase
			.from('prompts')
			.upsert({ user_id: userID, prompt: $blocks, id: userID }); // save all blocks for now
			// .upsert({ user_id: user, prompt: $blocks?.[$rootBlock], id: $rootBlock });
	}

	onMount(async () => {
		blocksFromDB = await load();

		const promptList = blocksFromDB[0]["prompt"];
		// console.log("promptList",promptList);

		blocks.update(localState => {
			return {
				...localState,
				...promptList
			}
		})
	});


	function addBlock(){
		const newBlockID = blocks.insertBlock({text: 'Untitled Prompt', type: 'prompt', children: [{text: 'empty block'}]});
		blocks.selectSingleBlock(newBlockID);
	}


	let promptRefs = {};

	function changeBlockTitle(blockID: string, newTitle: string){
		blocks.updateBlockProperty(blockID,'text',newTitle)
	}
</script>

<main>
	<!-- SIDEBAR -->
	<aside>

		<header>
			{#if data.session}
				<button class="primary" on:click={() => savePrompt(userID)}>
					<Icon src="upload-cloud.svg" color="var(--violet-lightest)" />
					<span>Save to Cloud</span>
				</button>
			{/if}
			<button 
				class="primary" 
				on:click={addBlock}>
				<Icon src="plus.svg" color="var(--violet-lightest)" />
				<span>New Prompt</span>
			</button>
		</header>
		
		<nav>
			<p class="caps">Prompts:</p>
			{#each Object.entries($blocks).sort((a, b) => new Date(b[1].createdAt) - new Date(a[1].createdAt)) as [uuid, block], i}
				<NavPromptButton
					uuid={uuid}
					block={block}
				/>
			{/each}
		</nav>

		<footer>
			<a class="button secondary" href="https://github.com/johannesmutter/promptly" target="_blank">
				<Icon src="github.svg" color="var(--primary)" />
				<span>Contribute on GitHub</span>
			</a>
			<a class="button secondary" href="mailto:promptly@mutter.co">⭐️ Give us Feedback</a>
			{#if data.session}
			<p style="padding: 10px 0;"><small>Signed in as: {data?.session?.user.email}</small></p>
			<form action="/logout" method="POST" use:enhance={submitLogout}>
				<button type="submit">Logout</button>
			</form>
			{:else}
			<a class="button" href="/otlogin">Sign Up / Login</a>
			{/if}
			<small style="display: flex; justify-content: space-between; padding: var(--size-1); color: var(--grey-300)">
				<a href="/privacy">Privacy</a>&nbsp;|&nbsp;
				<a href="/privacy">Terms of Use</a>
			</small>
		</footer>		
	</aside>

	<!-- EDITOR -->
	<section>
		{#if $selectedBlockIDs[0]}
			<Editor expanded={true} parentID={$selectedBlockIDs[0]} />
		{/if}
	</section>
</main>


<style lang="postcss">	
	main {
		display: grid;
		grid-template-columns: 260px auto;
		gap: var(--size-3);
		min-height: 100vh;
	}
	section {
		padding: var(--size-3);
	}
	aside {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		gap: var(--size-1);
		padding: var(--size-1);
		background-color: var(--grey-100);
		border-top-right-radius: var(--border-radius);
		border-bottom-right-radius: var(--border-radius);
		& nav, header, footer {
			display: flex;
			flex-direction: column;
			gap: var(--size-1);
		}
		& header {
			margin-bottom: var(--size-6);
		}
		& footer {
			margin-top: auto;
		}
		& button, .button {
			font-size: 1rem;
			background-color: var(--primary);
			color: #FFF;
			border-radius: var(--border-radius);
			margin: 0;
			padding: var(--size-1);
			text-align: left;
			display: flex;
			align-items: center;
			gap: var(--size-2);
			text-decoration: none;
			&.secondary {
				background-color: #FFF;
				border: 1px solid var(--primary);
				color: var(--primary);
			}
		}

		& nav > button {
		}
	}
</style>
