<script>
  let map = $state(new Map([["a", 1]]));
  let set = $state(new Set([1]));

  function* generate() {
    yield 1;
    yield 2;
  }

  const arrayLike = { length: 2 };
  const chained = [1, 2, 3].filter((n) => n > 1).map((n) => n * 2);
</script>

{#each map as [key, value]}
  <b>{key}{value}</b>
{/each}

{#each set as value}
  <b>{value}</b>
{/each}

{#each [...generate()] as value}
  <b>{value}</b>
{/each}

{#each arrayLike as _, index}
  <b>{index}</b>
{/each}

{#each chained as value}
  <b>{value}</b>
{/each}

{#each map.keys() as key}
  <b>{key}</b>
{/each}
