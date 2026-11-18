<script>
  export let id;
  export let items;
  $: out = items.map(({ items: id }) => id);
</script>

<p>{out}</p>
