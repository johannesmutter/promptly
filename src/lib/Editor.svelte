<script>
	import { onMount } from "svelte";
	import CommandDropdown from "$lib/CommandDropdown.svelte";
	import { blocks } from "$lib/stores/blocks";
	import Caret from "./Caret.svelte";
	import Prompt from "./blocks/Prompt.svelte";
	import { filterUniqueByKey } from "$lib/utils/filterUniqueByKey";

	/** @type {string} */
	export let parentID;

	/** @type {Array<Record<string, any>>} */
	let uniqueChildren = [];

	$: {
		if ($blocks?.[parentID]?.children) {
			uniqueChildren = filterUniqueByKey($blocks[parentID].children, 'id');
		} else {
			uniqueChildren = [];
		}
	}

	// Refs
	let 
		/** @type {HTMLTextAreaElement} */		
		textareaRef, 
		/** @type {HTMLDivElement} */
		editorRef, 
		/** @type {CommandDropdown|null} */
		commandDropdownRef, 
		/** @type {HTMLElement[]} */
		blockRefs = [];

	/** @type number */
	let currentBlockIndex = 0;
	

	/**
	 * @typedef {Object} CaretPosition
	 * @property {number} offset - The offset of the caret within the block
	 * @property {number} x - The x-coordinate of the caret
	 * @property {number} y - The y-coordinate of the caret
	 * @property {number} absX - The absolute x-coordinate of the caret relative to the viewport
	 * @property {number} absY - The absolute y-coordinate of the caret relative to the viewport
	 * @property {number} lineIndex - The index of the line containing the caret
	 * @property {number} height - The height of the line containing the caret
	 */
	/** @type CaretPosition */
	let currentCaret = {
		offset: 0,
		x: 0,
		y: 0,
		absX: 0,
		absY: 0,
		lineIndex: 0,
		height: 0
	}

	/**
	 * @typedef {Object} Command
	 * @property {string} name - The name of the command
	 * @property {Function} action - The function to execute when the command is selected
	 */
	/** @type Command[] */
	const commands = [
		{
			name: "Text",
			action: () => { console.log("text action") },
		},
		{
			name: "Code",
			action: () => { console.log("code action") },
		},
		{			
			name: "Prompt",
			action: () => {
				blocks.insertBlock(
					{text: 'Untitled Prompt', type: 'prompt'},
					parentID,
					currentBlockIndex,
					currentCaret.offset,
					2
				);
				setCaretPosition(currentBlockIndex + 1, 0);
				commandDropdownRef?.close()
			},
		},
	];
	
	/**
	 * Get the current child object and its text from the $blocks store.
	 * @returns {{currentChild: {id: string}|undefined, currentChildText: string}}
	 */
	function getCurrentChildAndText() {
		const currentChild = $blocks[parentID]?.children?.[currentBlockIndex];
		const currentChildText = currentChild?.text ?? (currentChild?.id ? $blocks[currentChild.id].text : '');

		return { currentChild, currentChildText };
	}

	function handleInput() {
		const newText = textareaRef.value;
		const cursorPosition = textareaRef.selectionStart;

		// Hide the commandDropdown if the double brackets at the current cursor position are deleted
		if (!(newText.charAt(cursorPosition - 1) === "[" && newText.charAt(cursorPosition - 2) === "[")) {
			commandDropdownRef?.close()
		}

		// Update the text for the current block
		const { currentChild } = getCurrentChildAndText();
		if(currentChild){
			// 1. if block has type/ id, update the block at the store root
			if(currentChild?.id){
				blocks.updateBlockProperty(currentChild?.id,'text',newText);
			} else {
				// 2. if the block is text only, update the child in [parentID].children[currentBlockIndex]
				blocks.updateChildProperty(parentID,currentBlockIndex,'text',newText);
			}
		}
	}

	/** @param {KeyboardEvent} event */
	function handleKeyDown(event) {
		const { key, ctrlKey, metaKey, shiftKey, altKey } = event;

		const { currentChildText } = getCurrentChildAndText();
		const charBeforeCaret = currentChildText?.charAt(currentCaret.offset-1);

		if (key === "Enter") {
			event.preventDefault();
			enter();
		} else if ((ctrlKey || metaKey) && key === "b") {
			event.preventDefault();
			toggleBold();
		} else if ( key === "[" && charBeforeCaret === "[") {
			commandDropdownRef?.open()
		} else if ((ctrlKey || metaKey) && key === "c") {
			//event.preventDefault();
			//copy();
		} else if ((ctrlKey || metaKey) && key === "v") {
			//event.preventDefault();
			//paste();
		} else if ((ctrlKey || metaKey) && key === "x") {
			//event.preventDefault();
			//extract();
		} else if ((ctrlKey || metaKey) && key === "a") {
			//event.preventDefault();
			//selectAll();
		} else if (key === "ArrowLeft") {
			//event.preventDefault();
			moveCursorLeft(shiftKey,altKey);
		} else if (key === "ArrowRight") {
			//event.preventDefault();
			moveCursorRight(shiftKey,altKey);
		} else if (key === "ArrowUp") {
			//event.preventDefault();
			moveCursorUp(shiftKey,altKey);
		} else if (key === "ArrowDown") {
			//event.preventDefault();
			moveCursorDown(shiftKey,altKey);
		}

		setTimeout(() => {
			currentCaret.offset = textareaRef.selectionStart;
			setVirtualCaretPosition()
		}, 0);
	}

	/**
	 * @param {number} blockIndex
	 * @param {number} offset
	 */
	function setCaretPosition(blockIndex, offset) {
		currentBlockIndex = blockIndex;
		currentCaret.offset = offset;
		setTimeout(() => {
			const { currentChildText } = getCurrentChildAndText();
			textareaRef.value = currentChildText ?? '';
			textareaRef.setSelectionRange(currentCaret.offset, currentCaret.offset);
			setVirtualCaretPosition();
			focusTextarea();
		}, 0);
	}


	function enter() {
		blocks.insertBlock(undefined,parentID,currentBlockIndex,currentCaret.offset)
		// Question: Should a new block be created, or should we split the current block at caret position
		setCaretPosition(currentBlockIndex + 1, 0);
	}

	function moveCursorUp(shiftKey,altKey) {
		if (currentBlockIndex > 0) {
			currentBlockIndex--;
			const { currentChildText } = getCurrentChildAndText();
			const prevBlockTextLength = currentChildText?.length;
			// const newOffset = Math.min(currentCaret.offset, prevBlockTextLength);
			setCaretPosition(currentBlockIndex, prevBlockTextLength);
		}
	}

	function moveCursorDown(shiftKey,altKey) {
		if (currentBlockIndex < $blocks[parentID].children.length - 1) {
			currentBlockIndex++;
			// const { currentChildText } = getCurrentChildAndText();
			// const nextBlockTextLength = currentChildText?.length;
			// const newOffset = Math.min(currentCaret.offset, nextBlockTextLength);
			setCaretPosition(currentBlockIndex, 0);
		}
	}

	function createWordBoundaryRegex() { // must be a function that returns a new RegExp when call, can't be a static variable
		return new RegExp(/[\s.,;:?!'"()[\]{}<>|\\/~`@#$%^&*+=_-]/, 'g');
	}

	/**
	 * Finds the next word boundary position based on the direction.
	 * @param {string} slicedText - The sliced text based on the current caret position.
	 * @param {number} textLength - The length of the original text.
	 * @param {'left'|'right'} direction - The direction of the cursor movement.
	 * @returns {number|undefined} The new caret offset based on the word boundary.
	 */
	function findWordBoundary(slicedText, textLength, direction) {

		const wordBoundaryRegex = createWordBoundaryRegex();

		if (direction === 'left') {
			let lastIndex, match;

			// Iterate through the slicedText to find word boundary characters
			while ((match = wordBoundaryRegex.exec(slicedText)) !== null) {
				if (match.index >= currentCaret.offset - 1) break;
				lastIndex = match.index;
			}

			return lastIndex ?? 0;
		} else if (direction === 'right') {
			const match = wordBoundaryRegex.exec(slicedText);
			return match ? currentCaret.offset + match.index + 1 : textLength;
		}
	}

/**
 * Moves the cursor by a word based on the direction.
 * @param {'left'|'right'} direction - The direction of the cursor movement.
 */
 function moveCursorByWord(direction) {
	const { currentChildText } = getCurrentChildAndText();
		const slicedText = direction === 'left' ? currentChildText.slice(0, currentCaret.offset) : currentChildText.slice(currentCaret.offset);

		const newCaretOffset = findWordBoundary(slicedText, currentChildText.length, direction);

		// If moving to the right and reaching the end of the text, go to the next block if there is one
		if (direction === 'right' && newCaretOffset === currentChildText.length && (currentBlockIndex <= $blocks[parentID].children.length - 1)) {
			currentBlockIndex++;
			currentCaret.offset = 0;
		} 
		// If moving to the left and reaching the beginning of the text, go to the previous block if there is one
		else if (direction === 'left' && newCaretOffset === 0 && currentBlockIndex > 0) {
			currentBlockIndex--;
			currentCaret.offset = currentChildText.length;
		} 
		// Update the caret position based on the new offset
		else {
			currentCaret.offset = newCaretOffset
		}
	}

	function moveCursorLeft(shiftKey, altKey) {
		if (altKey) {
			moveCursorByWord('left');
		} else {
			if (currentCaret.offset > 0) {
				currentCaret.offset--;
			} else if (currentBlockIndex > 0) {
				currentBlockIndex--;
				const { currentChildText } = getCurrentChildAndText();
				currentCaret.offset = currentChildText.length;
			}
		}

		setCaretPosition(currentBlockIndex, currentCaret.offset);
	}

	function moveCursorRight(shiftKey, altKey) {
		if (altKey) {
			moveCursorByWord('right');
		} else {
			const { currentChildText } = getCurrentChildAndText();
			if (currentCaret.offset < currentChildText.length) {
				currentCaret.offset++;
			} else if (currentBlockIndex < $blocks[parentID].children.length - 1) {
				currentBlockIndex++;
				currentCaret.offset = 0;
			}
		}

		setCaretPosition(currentBlockIndex, currentCaret.offset);
	}

	function handleClick(event) {
		const blockIndex = parseInt(event.currentTarget.dataset.block);
		const range = window.getSelection().getRangeAt(0);
		const clickedOffset = range.startOffset;

		if (currentBlockIndex !== blockIndex || currentCaret.offset !== clickedOffset) {
			setCaretPosition(blockIndex, clickedOffset);
		}
	}

	function focusTextarea() {
		textareaRef.focus();
		textareaRef.setSelectionRange(currentCaret.offset, currentCaret.offset);
	}

	/**
	 * Recursively finds the first text node within the given node.
	 * @param {Node} node - The starting DOM node to search for a text node.
	 * @returns {?Text} - The first text node found or null if none found.
	 */
	function findFirstTextNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
			return /** @type {Text} */ (node);
    }
    for (let child of node.childNodes) {
        const textNode = findFirstTextNode(child);
        if (textNode) {
            return textNode;
        }
    }
    return null;
	}

	function setVirtualCaretPosition() {
    const blockNode = blockRefs[currentBlockIndex];

		if (!blockNode) return
			
    const textNode = findFirstTextNode(blockNode);

		// Create a new Range object, used to represent a range of text in the DOM
		const range = document.createRange(); 

		// Ensure the caret offset is within the bounds of the text node's length
		const caretOffset = Math.min(currentCaret.offset, textNode?.length);

		// Set the start + end of the range to the current caret's offset within the text node
		// This essentially creates a zero-width range at the caret's position
		range.setStart(textNode, caretOffset);
		range.setEnd(textNode, caretOffset);
		
		const caretRect = range.getBoundingClientRect(); // get the caret position relative to the viewport
		
		// These rectangles represent the lines of text within the block
		const rects = blockNode.getClientRects();
		
		// Find the index of the current line based on the caret's rect, using binary search
		let lineIndex = 0, left = 0, right = rects.length - 1;

		while (left <= right) {
			let mid = Math.floor((left + right) / 2);

			if (caretRect.top > rects[mid].top) {
				lineIndex = mid;
				left = mid + 1;
			} else {
				right = mid - 1;
			}
		}
		
		const currentRect = rects[lineIndex];

		const editorRect = editorRef.getBoundingClientRect();

		
		
		// rectInlineOffsetLeft calculates the left offset of the first inline element in the current line for accurate virtual caret positioning. It uses the first line's rectangle left position if not on the first line, otherwise the current line's rectangle left position. This accounts for indentation caused by preceding inline blocks.
		// const rectInlineOffsetLeft = lineIndex >= 1 ? rects[0].left : currentRect.left;			
		// relative to currentBlock
		// const newX = caretRect.left - rectInlineOffsetLeft;

		// relative to editor
		const newX = caretRect.left - editorRect.left;
		
		const lineHeight = blockNode.getBoundingClientRect().height / rects.length

		// Set y relative to the currentBlock
		// const newY = lineHeight * lineIndex
		
		// Set y relative to the editor
		const newY = currentRect.top - editorRect.top;


		// update caret
		currentCaret = {
			...currentCaret,
			x: newX,
			y: newY,
			absX: caretRect.left,
			absY: caretRect.top,
			lineIndex: lineIndex,
			height: lineHeight
		}
	}

	function toggleBold() {
		const currentChild = $blocks[parentID]?.children?.[currentBlockIndex];
		if (!currentChild) {
			console.error(`Error: block ${currentBlockIndex} does not exist`);
			return;
		}

		const { annotations } = currentChild;
		const newAnnotations = annotations && annotations?.length > 0 && annotations.includes('bold') ? 
					annotations.filter(_ => _ !== 'bold') : 
		[...(annotations || []), 'bold'];
		blocks.updateChildProperty(parentID,currentBlockIndex,'annotations',newAnnotations)
	}

	onMount(()=>{
		// set initial value
		const { currentChildText } = getCurrentChildAndText();
		textareaRef.value = currentChildText;
	})
</script>

<div>
	<textarea
		bind:this={textareaRef}
		on:input={handleInput}
		on:keydown={handleKeyDown}
	></textarea>
	<div 
		bind:this={editorRef}
		class="editor"
		contenteditable={false}
		on:click={focusTextarea} 
		on:touchstart={focusTextarea} 
		on:keydown
	>
		{#if $blocks?.[parentID]?.children}
			{#each $blocks[parentID].children as {id, text, annotations}, i}

				<div 
					class="block {id ? 'prompt' : ''}" 
					class:bold={annotations?.includes('bold')}
					on:click={handleClick}
					on:touchstart={handleClick}
					on:keydown
					data-block={i}
					bind:this={blockRefs[i]}
				>
					{#if typeof id === 'string' && id !== undefined}
						<Prompt {id} />
						<!-- {@html $blocks[id].text} -->
					{:else}
						{@html text}
					{/if}
					<!-- {#if currentBlockIndex === i}<Caret left={currentCaret.x} top={currentCaret.y} height={currentCaret.height} />{/if} -->
				</div>
			{/each}
		{/if}
		<Caret left={currentCaret.x} top={currentCaret.y} height={currentCaret.height} />
	</div>
	<CommandDropdown
		bind:this={commandDropdownRef}
		{commands}
		{editorRef}
		{currentCaret}
	/>
</div>

<pre>{JSON.stringify(currentCaret,null,2)}</pre>

<!-- List all blocks with id -->
<div class="referenced-blocks">
  {#each uniqueChildren as child, i}
		{#if child.id}
		<details class="child-block-container">
			<summary role="button" class="secondary">{$blocks[child.id].text}</summary>
			<svelte:self parentID={child.id} />
		</details>
		{/if}
	{/each}
</div>


<!-- Debugging -->
<!-- <pre>
{#each $blocks?.[parentID]?.children || [] as child, i }
<span style={currentBlockIndex === i ? 'background-color: var(--bg-red);' : ''}>{JSON.stringify(child,null,0)}
</span>
{/each}
</pre>
<pre>
{#each Object.entries($blocks) as [id,block] }
{@const currentChild = $blocks[parentID]?.children?.[currentBlockIndex]}
<span style={(currentChild.id === id) ? 'background-color: var(--bg-red);' : ''}>{JSON.stringify(block,null,0)}
</span>	
<br>
{/each}
</pre>
	 -->

<style lang="postcss">
	textarea {
		min-width: 0;
    min-height: 0;
    margin: 0;
    padding: 0;
    position: absolute;
    outline: none!important;
    resize: none;
    border: none;
    overflow: hidden;
    color: transparent;
    background-color: transparent;
    z-index: -10;
		opacity: 0;
		pointer-events: none;
	}
	.editor {
		min-width: 300px;
		min-height: 100px;
		border: 1px solid #ccc;
		padding: 30px;
		position: relative;
		cursor: text;
	}

	.block {
		--base-line-height: 1.5;
		display: inline;
		position: relative;
		border: 0.1px solid var(--blue-lightest);
		word-break: break-all;
		word-wrap: break-word; /* break long words */
		overflow-wrap: break-word;
		hyphens: auto;
		white-space: pre-wrap;
		line-height: var(--base-line-height);
		padding-top: calc((var(--base-line-height) - 1) * 0.31em);
		padding-bottom: calc((var(--base-line-height) - 1) * 0.3em);
	}
	.block.bold {
		font-weight: 700;
	}
	.block.prompt {
		background-color: var(--yellow-lightest);
	}
	pre {
		font-size: 12px;
	}

	.referenced-blocks {
		display: grid;
		gap: 10px;
		grid-template-columns: repeat(auto-fill, minmax(50ex, 1fr));
		grid-template-rows: masonry;
		align-items: flex-start;
	}

	.child-block-container {
		background-color: var(--grey-200);
		margin: var(--size-3);
		padding: var(--size-2);
	}
	:global(.child-block-container .child-block-container){
		border-left: 4px solid var(--secondary);
	}
</style>