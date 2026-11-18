<script>
  export let id;
  export let items;
  $: out = items.map((o = { id }) => o);
</script>

<p>{out}</p>
