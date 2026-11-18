<script>
let promise = Promise.resolve(42);
</script>

{#await promise}
  <p>pending</p>
{:then value}
  <p>then {value}</p>
{:catch error}
  <p>error {error}</p>
{/await}