<script>
  export let total;
  $: half = total / 2; // halve it
</script>

<p>{half}</p>
