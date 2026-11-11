<script>
  export let id;
  export let items;
  $: out = items.map(function pick({ id }) { return id; });
</script>

<p>{out}</p>
