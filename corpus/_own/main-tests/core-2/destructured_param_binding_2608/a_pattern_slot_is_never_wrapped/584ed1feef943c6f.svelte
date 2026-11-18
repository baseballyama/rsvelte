<script>
  export let id;
  export let items;
  $: out = items.map(({ a: { id } }) => id);
</script>

<p>{out}</p>
