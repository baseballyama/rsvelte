<script>
  export let id;
  export let items;
  $: out = items.map(({ n = id }) => n);
</script>

<p>{out}</p>
