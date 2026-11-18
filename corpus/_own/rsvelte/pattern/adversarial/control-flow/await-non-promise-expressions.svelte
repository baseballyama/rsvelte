<script>
  let n = $state(1);
  const table = { value: Promise.resolve(2) };

  function make() {
    return 3;
  }
</script>

{#await 1 then value}
  <b>{value}</b>
{/await}

{#await "text" then value}
  <b>{value}</b>
{/await}

{#await n then value}
  <b>{value}</b>
{/await}

{#await table.value then value}
  <b>{value}</b>
{/await}

{#await make() then value}
  <b>{value}</b>
{/await}

{#await (n, Promise.resolve(n)) then value}
  <b>{value}</b>
{/await}

{#await [Promise.resolve(1)][0] then value}
  <b>{value}</b>
{/await}

{#await Promise.resolve().then(() => n) then value}
  <b>{value}</b>
{/await}
