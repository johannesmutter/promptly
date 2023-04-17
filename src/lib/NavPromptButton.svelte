<script>
  import Icon from '$lib/Icon.svelte';
	import { blocks } from '$lib/stores/blocks';

  export let uuid;
  export let block;
  
  let disabled = true;

  /** @type {HTMLInputElement} */
  let promptRef;

  function toggleEditing() {
    disabled = !disabled
    if (!disabled) {
      setTimeout(() => {
        promptRef.focus();        
      }, 0);
    }
  }

  function changeBlockTitle(blockID, newTitle){
		blocks.updateBlockProperty(blockID,'text',newTitle)
	}

  function handleEnter(event) {
    if (event.key === 'Enter') {
      disabled = true;
    }
  }

</script>

<button
  class:selected={block?.selected}
  on:click={()=>{blocks.selectSingleBlock(uuid)}}
>
  {#if block?.children?.length > 1}
    <Icon src="message-spiral.svg" color="var(--violet-dark)" />
  {/if}

  <input
    type="text"
    bind:this={promptRef}
    value={block.text}
    on:change={(event) => changeBlockTitle(uuid, event.target.value)}
    on:blur={()=>{disabled = true}}
    on:keydown={handleEnter}
    disabled={disabled}
  />

  {#if block?.selected && disabled}
    <button on:click={toggleEditing}>
      <Icon src="edit.svg" color="var(--violet-dark)" />
    </button>
  {/if}
</button>


<style lang="postcss">
  button {
    color: var(--gey-800);
    background-color: transparent;
    padding: var(--size-1) var(--size-2);
    margin: 0;
    text-align: left;
    display: flex;
    align-items: center;
    gap: var(--size-2);
    border: 1px solid transparent;
    white-space: nowrap;
    position: relative;
    overflow: hidden;
    transition: all 200ms ease-in-out 0s;
    &.selected {
      background-color: var(--violet-lightest);
      color: var(--violet-dark);
      border-color: var(--violet-base);
    }
    &:not(.selected):hover {
      transition: all 200ms ease-in-out 0s;
      background-color: var(--grey-300);
    }
    
    & input {
      width: calc(100% - 30px);
      display: inline-block;
      mask-image: linear-gradient(to left, transparent, #fff 20%);
      margin: 0;
      background: none;
      border: none;
      padding: 0 !important;
      height: fit-content !important;
      color: inherit;
    }
    & button {
      position: absolute;
      right: 0;
      background: linear-gradient(to right, rgba(255,255,255,0.4), rgba(255,255,255,0.7) 80% );
      width: fit-content;
      backdrop-filter: blur(5px);
      &:hover {
        background: linear-gradient(to right, rgba(255,255,255,0.9), rgba(255,255,255,1) 80% );
      }
    }
  }
  
</style>
