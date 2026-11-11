<script>
  let active = $state(false);
  let color = $derived(active ? 'red' : 'blue');
</script>

<button onclick={() => (active = !active)}>toggle</button>
<p style="color:black;padding:1px" style:color={color} style:--gap|important={active ? '2px' : null} style:margin={active ? '3px' : null}>styles</p>
