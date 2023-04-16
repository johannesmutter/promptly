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

	let userID = data?.session?.user?.id;

	const publicUserID = '69dff67a-2ccb-4071-9bbe-fe32694a194a'

	let blocksFromDB = [];

	export async function load() {
		const { data } = await supabase
			.from('prompts')
			.select()
			.or(`user_id.eq.${userID},user_id.eq.${publicUserID}`);
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
		console.log("promptList",promptList);

		blocks.update(localState => {
			return {
				...localState,
				...promptList
			}
		})
	});
</script>

<main>
	<!-- SIDEBAR -->
	<aside>
		<header>
			{#if data.session}
				<button class="primary" on:click={() => savePrompt(userID)}>
					<Icon src="upload-cloud.svg" color="var(--violet-dark)" />
					<span>Save to Cloud</span>
				</button>
			{/if}
			<button class="primary">
				<Icon src="plus.svg" color="var(--violet-dark)" />
				<span>New Prompt</span>
			</button>
		</header>
		
		<nav>
			<p class="caps">Prompts:</p>
			{#each Object.entries($blocks).sort((a, b) => new Date(b[1].createdAt) - new Date(a[1].createdAt)) as [uuid, block], i}
				<button on:click={()=>{blocks.selectSingleBlock(uuid)}} class:selected={block.selected}>

					{#if block?.children?.length > 1}
						<Icon src="message-spiral.svg" color="var(--violet-dark)" />
					{/if}
					<span>{block.text}</span>
				</button>
			{/each}
		</nav>



		<footer>
			{#if data.session}
				<form action="/logout" method="POST" use:enhance={submitLogout}>
					<button type="submit">Logout</button>
				</form>
			{:else}
				<a href="/otlogin">login</a>
			{/if}
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
		& button {
			margin: 0;
			padding: var(--size-1);
			text-align: left;
			display: flex;
			gap: var(--size-2)
		}
		& nav > button {
			background-color: transparent;
			text-align: left;
			padding: var(--size-1) var(--size-2);
			color: var(--gey-800);
			border: 1px solid transparent;
			margin: 0;
			white-space: nowrap;
			position: relative;
			overflow: hidden;
			transition: all 200ms ease-in-out 0s;
			&.selected {
				background-color: var(--violet-lightest);
				color: var(--violet-base);
				border-color: var(--violet-base);
			}
			& span {
				width: calc(100% - 30px);
				display: inline-block;
				mask-image: linear-gradient(to left, transparent, #fff 20%);
			}
			&:not(.selected):hover {
				transition: all 200ms ease-in-out 0s;
				background-color: var(--grey-300);
			}
		}
	}
</style>
