<script>
  export let a;
  export let b;
  $: label =
    a?.replace(/^https?:\/\//, '') ||
    b;
</script>

<p>{label}</p>
