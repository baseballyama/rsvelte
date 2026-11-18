<script>
  let active = $state(false);
</script>

<button onclick={() => (active = !active)}>toggle</button>
<p class={active ? ['active'] : []} class:extra={active}>styled</p>
<div {...{ class: active ? 'active' : '', title: 'spread' }}>spread</div>

<style>
  p { color: red; }
  .active { font-weight: bold; }
  :global(body) { margin: 0; }
  div { border: 1px solid; }
</style>
