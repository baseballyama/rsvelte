<script>
  export let id;
  export let items;
  $: out = items.map(([...id]) => id);
</script>

<p>{out}</p>
