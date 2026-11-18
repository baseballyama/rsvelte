<script>
  let value = $state.raw(Promise.resolve('first'));
</script>
<button onclick={() => value = Promise.resolve('second')}>resolve</button>
<button onclick={() => value = Promise.reject('failure')}>reject</button>
<button onclick={() => value = 'plain'}>plain</button>
{#await value}
  <p>pending</p>
{:then result}
  <p>then:{result}</p>
{:catch error}
  <p>catch:{error}</p>
{/await}
