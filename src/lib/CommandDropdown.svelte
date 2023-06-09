<script>
	import { afterUpdate, tick, createEventDispatcher } from "svelte";
	import { clickOutside } from "$lib/actions/clickOutside.js";
	import { pressEsc } from "$lib/actions/pressEsc.js";	
	import { pressArrowKeys } from "$lib/actions/pressArrowKeys.js";

	export let commands = [];
	export let searchInput = "";
	export let visible = false;
	export let editorRef;
	export let currentCaret;

	const dispatch = createEventDispatcher();
	
	$: commandsLength = commands.length;
	
	/** @type {HTMLDivElement} */
	let dropdownRef;
	let selectedCommandIndex = 0;
	let width = 200;
	let height = 150;
	let x = 0;
	let y = 0;

	afterUpdate(() => {
		if (visible) {
			setTimeout(()=>{
				dropdownRef.focus();
				// ToDo: Don't set focus and handle the arrow done/ up navigation from outside
  			// by exporting the "selectedCommandIndex" variable and setting it from a parent component
			},1)
		}
	});

	export function open() {

		// Get the editor node and its bounding rect
		const editorNodeRect = editorRef.getBoundingClientRect();

		// Check if there's enough space on the right side
		// If not align to the right side of the editor
		x = Math.min(currentCaret.absX, editorNodeRect.right - width);
		
		// Check if there's enough space at the bottom of the viewport
		const spaceToBottom = window.innerHeight - (currentCaret.absY + currentCaret.height);

		if (spaceToBottom >= height) {
			// Display the dropdown below the caret
			y = currentCaret.absY + currentCaret.height;
		} else {
			// Display the dropdown above the caret
			y = currentCaret.absY - currentCaret.height - height;
		}

		visible = true;
		dispatch('open')
	}

	export function close() {
		visible = false;
		dispatch('close')
	}

	function handleCommandClick(command) {
		command.action();
	}

	function selectPreviousCommand(commandsLength) {
			if (selectedCommandIndex === 0) {
					selectedCommandIndex = commandsLength - 1; // Jump to the end of the list
			} else {
					selectedCommandIndex -= 1;
			}
	}

	function selectNextCommand(commandsLength) {
			if (selectedCommandIndex === commandsLength - 1) {
					selectedCommandIndex = 0; // Jump to the beginning of the list
			} else {
					selectedCommandIndex += 1;
			}
	}


	function handleEnter(event) {
		if (event.key === 'Enter') {
			event.preventDefault();
			commands[selectedCommandIndex].action();
		}
	}

	function handleArrowKey(key) {
		switch (key) {
			case "ArrowUp":
				selectPreviousCommand(commandsLength);
				break;
			case "ArrowDown":
				selectNextCommand(commandsLength);
				break;
		}
	}
</script>

<div
    bind:this={dropdownRef}
    class="command-dropdown"
    style="left: {x}px; top: {y}px; width: {width}px; height: {height}px;"
    class:visible={visible}
    use:clickOutside={{ enabled: visible, callback: close }}
    use:pressEsc={{ enabled: visible, callback: close }}
    use:pressArrowKeys={handleArrowKey}
    on:keydown={handleEnter}
    tabindex="-1"
>
	<p class="caps">Insert Block</p>
	<!-- <input class="search-input" type="text" bind:value={searchInput} placeholder="Search..." /> -->
	{#each commands as command, i}
			<button
				class="command {i === selectedCommandIndex ? 'selected' : ''}"
				on:click={() => handleCommandClick(command)}
				on:mouseover={()=> selectedCommandIndex = i}
				on:focus={()=> selectedCommandIndex = i}
			>
					<span>{command.name}</span>
					{#if command.info}
						<span class="info">{command.info}</span>
					{/if}
			</button>
	{/each}
</div>

<style>
	.command-dropdown {
		position: absolute;
		background-color: white;
		border-radius: 4px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		padding: 8px;
		z-index: 100;
		display: none;
	}

	.command-dropdown.visible {
		display: flex;
		flex-direction: column;
	}
	
	button {
		all: unset;
    cursor: pointer;
	}

	.command {
		padding: 4px 8px;
		cursor: pointer;
	}
	.command .info {
		color: var(--grey-400);
		font-size: 0.8em;
	}

	.command.selected,
	.command:hover {
		background-color: var(--grey-100);
	}


	.search-input {
		width: 100%;
		padding: 4px;
		border: none;
		border-radius: 4px;
		margin-bottom: 8px;
	}
</style>
