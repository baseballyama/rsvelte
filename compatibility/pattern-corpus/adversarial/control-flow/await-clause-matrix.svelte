<script>
  let promise = $state(Promise.resolve({ v: 1 }));
</script>

{#await promise}
  <b>pending</b>
{:then { v }}
  <b>{v}</b>
{:catch error}
  <b>{error.message}</b>
{/await}

{#await promise then { v }}
  <b>{v}</b>
{/await}

{#await promise catch error}
  <b>{error.message}</b>
{/await}

{#await promise}
  <b>only pending</b>
{/await}

{#await Promise.all([promise, promise]) then [first, second]}
  <b>{first.v}{second.v}</b>
{/await}
