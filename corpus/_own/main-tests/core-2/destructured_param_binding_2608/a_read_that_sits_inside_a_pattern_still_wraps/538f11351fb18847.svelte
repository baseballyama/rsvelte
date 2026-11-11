<script>
  export let id;
  export let items;
  $: out = items.map(({ [id]: n }) => n);
</script>

<p>{out}</p>
