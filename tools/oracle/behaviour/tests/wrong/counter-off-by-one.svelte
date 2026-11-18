<script>
  let count = $state(0);
  let doubled = $derived(count * 2);
</script>

<div class="counter">
  <button class="dec" onclick={() => count--}>-</button><span class="count">{count}</span><button class="inc" onclick={() => (count += 2)}>+</button>
</div>
<p>doubled: {doubled}</p>
