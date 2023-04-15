<script>
  import Icon from "./Icon.svelte";
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let toggled = false;
</script>

<Icon
  on:click={() => {
    toggled = !toggled;
    dispatch('toggle', { toggled });
    console.log("toggle")
  }}
  width={16}
  height={16}
  src="arrow-right.svg"
  color={toggled ? 'var(--black)' : 'var(--grey-300)'} 
  transform={toggled ? 'rotateZ(90deg)' : ''} 
/>
