<script>
  export let items = [];
  let total = 0;
  let label = '';
  $: total = items.filter((i) => i.done).length;
  $: label = `${total} of ${items.length}`;
  $: if (total > 0) { console.log(label); }
</script>
<p>{label}{total}</p>