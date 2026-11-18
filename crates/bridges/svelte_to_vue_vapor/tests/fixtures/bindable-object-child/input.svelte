<script>
  let { object = $bindable({ count: 2 }), values = $bindable([3]) } = $props();
</script>
<p>{object.count}/{values.join(',')}</p>
<button class="mutate" onclick={() => { object.count++; values.push(object.count); }}>mutate</button>
<button class="replace" onclick={() => { object = { count: 10 }; values = [20]; }}>replace</button>
