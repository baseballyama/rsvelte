<script>
  const base = 4;
  let { object = { count: base }, list = [base, base + 1], callback = (value) => value + base } = $props();
  let tick = $state(0);
</script>
<p>{object.count}/{list.join(',')}/{callback(tick)}/{tick}</p>
<button class="mutate" onclick={() => { object.count++; list.push(9); }}>mutate</button>
<button class="tick" onclick={() => tick++}>tick</button>
