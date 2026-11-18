<script>
let p = Promise.resolve(1);
</script>

{#await p　then v}
  <p>{v}</p>
{/await}