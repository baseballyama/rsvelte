<script>
  let x = $state(50);
  let y = $state(70);
</script>
<svelte:window bind:scrollX={x} bind:scrollY={y} />
<div style="width: 2500px; height: 2500px">
  <p>{x}/{y}</p>
  <button class="state" onclick={() => { x += 100; y += 80; }}>state</button>
  <button class="native" onclick={() => window.scrollTo(30, 40)}>native</button>
</div>
