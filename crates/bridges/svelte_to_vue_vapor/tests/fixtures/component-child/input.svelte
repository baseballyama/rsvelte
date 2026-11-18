<script>
  let { count = 0, label = 'child', activate } = $props();
  let local = $state(0);
</script>
<p class="child">{label}:{count}:{local}</p>
<button class="child-update" onclick={() => { local++; activate?.(local); }}>child</button>
