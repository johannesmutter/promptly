<script>
  import { createEventDispatcher } from 'svelte';

  export let src = '';
  export let width = 24;
  export let height = 24;
  export let title = 'icon';
  export let color = 'currentColor';
  /** @type {string|undefined|null} */
  export let transform = undefined;

  const dispatch = createEventDispatcher();
</script>

<span
  on:click={() => {
    dispatch('click');
  }}
  style:background="{color}"
  style:width="{width}px"
  style:height="{height}px"
  style:transform="{transform}"
  style:-webkit-mask-image="url('/icons/{src}')"
  style:mask-image="url('/icons/{src}')"
  aria-label="{title}"
></span>


<style lang="postcss">
span {
  display: inline-block;
  vertical-align: text-top;
  mask-repeat: no-repeat;
  mask-position: center;
  transition: all 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
</style>