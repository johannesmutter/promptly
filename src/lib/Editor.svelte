<script>
	import { onMount, tick } from "svelte";
	import CommandDropdown from "./CommandDropdown.svelte";

	/**
	 * @typedef {Object} Block
	 * @property {string} name - The name of the block
	 * @property {string} text - The text content of the block
	 */
	/** @type Block[] */
	export let blocks;

	// Refs
	let 
		/** @type {HTMLTextAreaElement|null} */		
		textareaRef, 
		/** @type {HTMLDivElement|null} */
		editorRef, 
		/** @type {CommandDropdown|null} */
		commandDropdownRef, 
		blockRefs = [];

	/** @type number */
	let currentBlock = 0;

	/**
	 * @typedef {Object} CaretPosition
	 * @property {number} offset - The offset of the caret within the block
	 * @property {number} x - The x-coordinate of the caret
	 * @property {number} y - The y-coordinate of the caret
	 * @property {number} lineIndex - The index of the line containing the caret
	 * @property {number} height - The height of the line containing the caret
	 */
	/** @type CaretPosition */
	let currentCaret = {
		offset: 0,
		x: 0,
		y: 0,
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
				insertBlockAtCaret({ name: "Untitled Prompt", text: "Design your prompt" }, 2)
				setCaretPosition(currentBlock + 1, 0);
				commandDropdownRef.close()
			},
		},
	];
	

	// Reactive Statements
	$: if(currentCaret.offset >= 0) {
		// setVirtualCaretPosition(); // update caret when offset changes.
	}

	// functions

	function handleInput() {
		const newText = textareaRef.value;

		const cursorPosition = textareaRef.selectionStart;

		// Hide the commandDropdown if the double brackets at the current cursor position are deleted
		if (!(newText.charAt(cursorPosition - 1) === "[" && newText.charAt(cursorPosition - 2) === "[")) {
			commandDropdownRef.close()
		}

		// Split the new text into blocks
		const newBlocks = newText.split("\n");

		// Update the text and HTML for the current block
		$blocks[currentBlock] = {
			...$blocks[currentBlock],
			text: newBlocks[0],
		};

		// Update the text and HTML for any additional blocks
		for (let i = 1; i < newBlocks.length; i++) {
			currentBlock++;
			blocks.splice(currentBlock, 0, {
				...blocks[currentBlock],
				text: newBlocks[i],
			});
		}
	}

	function handleKeyDown(event) {
		const { key, ctrlKey, metaKey, shiftKey, altKey } = event;

		const charBeforeCaret = $blocks[currentBlock].text.charAt(currentCaret.offset-1);

		if (key === "Enter") {
			event.preventDefault();
			enter();
		} else if ((ctrlKey || metaKey) && key === "b") {
			event.preventDefault();
			toggleBold();
		} else if ( key === "[" && charBeforeCaret === "[") {
			commandDropdownRef.open()
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

	function setCaretPosition(blockIndex, offset) {
		currentBlock = blockIndex;
		currentCaret.offset = offset;
		textareaRef.value = $blocks[currentBlock].text;
		setTimeout(() => {
			textareaRef.setSelectionRange(currentCaret.offset, currentCaret.offset);
			setVirtualCaretPosition();
			focusTextarea();
		}, 0);
	}

	/**
	 * Inserts a block at the caret position. Blocks that are undefiend/null will be filtered out.
	 * @param {?Block} blockData - The block data to insert at the caret position, can be null/undefined
	 * @param {?number} offsetBefore - An optional negative offset, e.g. set to "2" to remove the brackets [[
 */
	function insertBlockAtCaret(insertedBlock,offsetBefore = 0) {
		const currentText = $blocks[currentBlock].text;
		const beforeCaretText = currentText.slice(0, currentCaret.offset - offsetBefore);
		const afterCaretText = currentText.slice(currentCaret.offset);

		const newBlocks = [
			...$blocks.slice(0, currentBlock),
			{ ...$blocks[currentBlock], text: beforeCaretText }, 				// old block with text before caret
			...(insertedBlock ? [insertedBlock] : []),            			// new insertion if defined
			{ text: afterCaretText }, 																	// new block with text after caret
			...$blocks.slice(currentBlock + 1),
		];
		
		textareaRef.value = afterCaretText; 		// update textarea with text from after caret
		blocks.set(newBlocks);
	}

	function enter() {
		insertBlockAtCaret()
		// Question: Should a new block be created, or should we split the current block at caret position
		setCaretPosition(currentBlock + 1, 0);
	}

	function moveCursorUp() {
		if (currentBlock > 0) {
			currentBlock--;
			const prevBlockTextLength = $blocks[currentBlock].text.length;
			const newOffset = Math.min(currentCaret.offset, prevBlockTextLength);
			setCaretPosition(currentBlock, newOffset);
		}
	}

	function moveCursorDown() {
		if (currentBlock < $blocks.length - 1) {
			currentBlock++;
			const nextBlockTextLength = $blocks[currentBlock].text.length;
			const newOffset = Math.min(currentCaret.offset, nextBlockTextLength);
			setCaretPosition(currentBlock, newOffset);
		}
	}

	function createWordBoundaryRegex() {
		return new RegExp(/[\s.,;:?!'"()[\]{}<>|\\/~`@#$%^&*+=_-]/, 'g');
	}

	function findWordBoundary(text, direction) {
		const wordBoundaryRegex = createWordBoundaryRegex();

		if (direction === 'left') {
			let lastIndex, match;

			// Iterate through the text to find word boundary characters
			while ((match = wordBoundaryRegex.exec(text)) !== null) {
				if (match.index >= currentCaret.offset - 1) break;
				lastIndex = match.index;
			}

			return lastIndex ?? 0;
		} else if (direction === 'right') {
			const match = wordBoundaryRegex.exec(text);
			return match ? currentCaret.offset + match.index + 1 : text.length;
		}
	}

	function moveCursorByWord(direction) {
		const text = $blocks[currentBlock].text;
		const slicedText = direction === 'left' ? text.slice(0, currentCaret.offset) : text.slice(currentCaret.offset);

		const newCaretOffset = findWordBoundary(slicedText, direction);

		if (direction === 'right' && newCaretOffset === text.length && currentBlock < $blocks.length - 1) {
			currentBlock++;
			currentCaret.offset = 0;
		} else if (direction === 'left' && newCaretOffset === 0 && currentBlock > 0) {
			currentBlock--;
			currentCaret.offset = $blocks[currentBlock].text.length;
		} else {
			currentCaret.offset = newCaretOffset;
		}
	}

	function moveCursorLeft(shiftKey, altKey) {
		if (altKey) {
			moveCursorByWord('left');
		} else {
			if (currentCaret.offset > 0) {
				currentCaret.offset--;
			} else if (currentBlock > 0) {
				currentBlock--;
				currentCaret.offset = $blocks[currentBlock].text.length;
			}
		}

		setCaretPosition(currentBlock, currentCaret.offset);
	}

	function moveCursorRight(shiftKey, altKey) {
		if (altKey) {
			moveCursorByWord('right');
		} else {
			if (currentCaret.offset < $blocks[currentBlock].text.length) {
				currentCaret.offset++;
			} else if (currentBlock < $blocks.length - 1) {
				currentBlock++;
				currentCaret.offset = 0;
			}
		}

		setCaretPosition(currentBlock, currentCaret.offset);
	}

	function handleClick(event) {
		const blockIndex = parseInt(event.currentTarget.dataset.block);
		const range = window.getSelection().getRangeAt(0);
		const clickedOffset = range.startOffset;

		if (currentBlock !== blockIndex || currentCaret.offset !== clickedOffset) {
			setCaretPosition(blockIndex, clickedOffset);
		}
	}

	function focusTextarea() {
		textareaRef.focus();
		textareaRef.setSelectionRange(currentCaret.offset, currentCaret.offset);
	}

	function setVirtualCaretPosition() {
    const blockNode = blockRefs[currentBlock];

		if (blockNode) {
			
			const textNode = blockNode.firstChild;

			// Create a new Range object, used to represent a range of text in the DOM
			const range = document.createRange(); 

			// Set the start + end of the range to the current caret's offset within the text node
			// This essentially creates a zero-width range at the caret's position
			range.setStart(textNode, currentCaret.offset);
			range.setEnd(textNode, currentCaret.offset);
			
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
			
			// rectInlineOffsetLeft calculates the left offset of the first inline element in the current line for accurate virtual caret positioning. It uses the first line's rectangle left position if not on the first line, otherwise the current line's rectangle left position. This accounts for indentation caused by preceding inline blocks.
			const rectInlineOffsetLeft = lineIndex >= 1 ? rects[0].left : currentRect.left;	
			
			const newX = caretRect.left - rectInlineOffsetLeft;
			
			//const lineHeight = currentRect.height;
			const lineHeight = blockNode.getBoundingClientRect().height / rects.length

			// Set y relative to the editor
			const editorRect = editorRef.getBoundingClientRect();
			//const newY = caretRect.top - editorRect.top + (caretRect.height > 0 ? caretRect.height : 0);
			const newY = lineHeight * lineIndex

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
	}

	function toggleBold() {
		if (!$blocks[currentBlock]) {
			console.error(`Error: block ${currentBlock} does not exist`);
			return;
		}

		const { text, annotations } = $blocks[currentBlock];
		const isBold = annotations?.includes('bold')
		const newAnnotations = annotations?.length > 0 && annotations.includes('bold') ? 
					annotations.filter(_ => _ !== 'bold') : 
		[...(annotations || []), 'bold'];
		$blocks[currentBlock].annotations = newAnnotations;
	}

	onMount(()=>{
		// set initial value
		textareaRef.value = $blocks[currentBlock].text;
	})
</script>

<div>
    <textarea
      bind:this={textareaRef}
      class="hidden-textarea"
      on:input={handleInput}
      on:keydown={handleKeyDown}
    ></textarea>
    <div 
			bind:this={editorRef}
		  class="editor"
		  contenteditable={false}
		  on:click={focusTextarea} 
		  on:keydown
		>
      {#each $blocks as block, i}
        <div 
					class="block" 
					class:bold={block.annotations?.includes('bold')}
					on:click={handleClick} 
					on:keydown
					data-block={i}
					bind:this={blockRefs[i]}
				>
					{@html block.text}
					{#if currentBlock === i}
						<span 
							class="caret" 
							style:left="{currentCaret.x}px"
							style:top="{currentCaret.y}px"
							style:height="{currentCaret.height}px"
						></span>
					{/if}
        </div>
      {/each}
    </div>
	  <CommandDropdown
			bind:this={commandDropdownRef}
			{commands}
			{editorRef}
			{currentCaret}
		/>
  </div>

<style>
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

	.editor .caret {
		width: 2px;
		height: 100%;
		background-color: var(--blue-base);
		position: absolute;
		pointer-events: none;
		left: 0;
		top: 0;
		opacity: 1;
		animation: cursor-blink 800ms steps(10) infinite 800ms;
	}

	@keyframes cursor-blink {
		0% {
			opacity: 0;
		}
		50% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}
</style>