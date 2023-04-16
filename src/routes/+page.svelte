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
		<nav>
			<button class="primary">
				<Icon src="plus.svg" color="var(--violet-dark)" />
				<span>New Prompt</span>
			</button>
			{#each Object.entries($blocks).sort((a, b) => new Date(b[1].createdAt) - new Date(a[1].createdAt)) as [uuid, block], i}
				<button on:click={()=>{blocks.selectSingleBlock(uuid)}} class:selected={block.selected}>
					<Icon src="message-spiral.svg" color="var(--violet-dark)" />
					<span>{block.text}</span>
				</button>
			{/each}
		</nav>

		<div class="account">
			{#if data.session}
				<form action="/logout" method="POST" use:enhance={submitLogout}>
					<button type="submit">Logout</button>
				</form>
			{:else}
				<a href="/otlogin">login</a>
			{/if}
		</div>		
	</aside>

	<!-- EDITOR -->
	<section>
		{#if $selectedBlockIDs[0]}
			<Editor expanded={true} parentID={$selectedBlockIDs[0]} />
		{/if}

		{#if data.session}
			<button on:click={() => savePrompt(userID)}>Save Prompt</button>
		{/if}
	</section>
</main>


<style lang="postcss">
	.account {
		display: flex;		
		flex-direction: column;
		& button {
			margin: 0;
			padding: var(--size-1)
		}
	}
	main {
		display: flex;
		gap: var(--size-3);
	}
	section {
		padding: var(--size-3);
	}
	aside {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: var(--size-1);
		padding: var(--size-1);
		width: var(--size-60);
		background-color: var(--grey-100);
		border-top-right-radius: var(--border-radius);
		border-bottom-right-radius: var(--border-radius);
		& nav {
			display: flex;
			flex-direction: column;
			gap: var(--size-1);
		}
		& nav > button {
			background-color: transparent;
			text-align: left;
			padding: var(--size-1) var(--size-2);
			color: var(--gey-800);
			border: none;
			margin: 0;
			white-space: nowrap;
			position: relative;
			overflow: hidden;
			transition: all 200ms ease-in-out 0s;
			&.primary {
				outline: 1px solid var(--grey-400)	;
				outline-offset: -4px;
				padding: var(--size-2) var(--size-2);
			}
			&.selected {
				background-color: var(--violet-light);
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
