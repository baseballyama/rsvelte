<script>
  export let id;
  export let items;
  $: out = items.find(({ id }) => id);
</script>

<p>{out}</p>
