<script>
  let width = $state(100);
  let height = $state(40);
  let visible = $state(true);
  let clientWidth = $state();
  let clientHeight = $state();
  let offsetWidth = $state();
  let offsetHeight = $state();
  let contentRect = $state();
  let contentBoxSize = $state();
  let borderBoxSize = $state();
  let devicePixelContentBoxSize = $state();
</script>
{#if visible}
  <div style:width="{width}px" style:height="{height}px" style:padding="10px" style:border="2px solid black" bind:clientWidth bind:clientHeight bind:offsetWidth bind:offsetHeight bind:contentRect bind:contentBoxSize bind:borderBoxSize bind:devicePixelContentBoxSize></div>
{/if}
<button class="resize" onclick={() => { width = 160; height = 60; }}>resize</button>
<button class="toggle" onclick={() => visible = !visible}>toggle</button>
<p>{clientWidth}:{clientHeight}:{offsetWidth}:{offsetHeight}:{contentRect?.width}:{contentRect?.height}:{contentBoxSize?.[0]?.inlineSize}:{borderBoxSize?.[0]?.inlineSize}:{devicePixelContentBoxSize?.[0]?.inlineSize}</p>
