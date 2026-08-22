<script>
  let width = $state(0);
  let height = $state(0);
  let scrollX = $state(0);
  let scrollY = $state(0);
  let outerWidth = $state(0);
  let outerHeight = $state(0);
  let devicePixelRatio = $state(1);
  let online = $state(true);
  let visibility = $state("visible");
  let active = $state(null);
</script>

<svelte:window
  bind:innerWidth={width}
  bind:innerHeight={height}
  bind:scrollX
  bind:scrollY
  bind:outerWidth
  bind:outerHeight
  bind:devicePixelRatio
  bind:online
  onresize={() => {}}
  onkeydown={() => {}}
/>

<svelte:document
  bind:visibilityState={visibility}
  bind:activeElement={active}
  onvisibilitychange={() => {}}
/>

<svelte:body onmouseenter={() => {}} onmouseleave={() => {}} />

<b>{width}{height}{scrollX}{scrollY}</b>
<b>{outerWidth}{outerHeight}{devicePixelRatio}{online}</b>
<b>{visibility}{active ? 1 : 0}</b>
