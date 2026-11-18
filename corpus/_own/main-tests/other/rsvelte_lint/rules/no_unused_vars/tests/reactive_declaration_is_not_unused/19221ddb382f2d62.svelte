<script>
  export let n;
  $: doubled = n * 2;
</script>
<p>{doubled}</p>