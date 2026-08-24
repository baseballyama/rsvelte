<script>
  let pending = $state(Promise.resolve(1));
  const rejected = Promise.reject(new Error("x"));
</script>

{#await pending}
  <b>a</b>
{/await}

{#await pending then value}
  <b>{value}</b>
{/await}

{#await pending}
  <b>b</b>
{:then}
  <b>c</b>
{/await}

{#await rejected catch}
  <b>d</b>
{/await}

{#await rejected}
  <b>e</b>
{:catch}
  <b>f</b>
{/await}

{#await pending}
  <b>g</b>
{:then value}
  <b>{value}</b>
{:catch error}
  <b>{error.message}</b>
{/await}

{#await pending then { toFixed }}
  <b>{typeof toFixed}</b>
{/await}

{#await Promise.all([pending, pending]) then [first, second]}
  <b>{first}{second}</b>
{/await}
