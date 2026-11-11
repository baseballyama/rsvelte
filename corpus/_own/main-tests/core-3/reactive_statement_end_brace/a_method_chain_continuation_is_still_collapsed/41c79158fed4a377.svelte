<script>
  export let count = 0
  $: ids = new Array(count)
    .fill(null)
    .map((_, i) => 'id-' + i)
</script>
<b>{ids}</b>
