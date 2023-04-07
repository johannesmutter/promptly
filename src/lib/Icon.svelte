<script>
  export let src = '';
  export let width = 24;
  export let height = 24;
  export let title = 'icon';
  export let color = 'currentColor';
</script>

<span style="-webkit-mask-image: url('/icons/{src}'); mask-image: url('/icons/{src}'); background: {color}; width: {width}px; height: {height}px;" aria-label={title}></span>

<style>
  span {
    display: inline-block;
    vertical-align: text-top;
    mask-repeat: no-repeat;
    mask-position: center;
  }
</style>