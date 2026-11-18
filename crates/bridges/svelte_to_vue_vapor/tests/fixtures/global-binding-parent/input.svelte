<script>
  import Child from '../global-binding-child/input.svelte';
  let visible = $state(true);
  if (typeof window !== 'undefined') Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1024 });
  function resize() {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: window.innerWidth + 50 });
    window.dispatchEvent(new Event('resize'));
  }
</script>
<button class="resize" onclick={resize}>resize</button>
<button class="toggle" onclick={() => visible = !visible}>toggle</button>
{#if visible}<Child label="first" />{/if}
<Child label="second" />
