<script>
  let items = $state([1, 2, 3]);
  const map = new Map([["a", 1]]);
  const set = new Set([1, 2]);
  const str = "ab";

  function* gen() {
    yield 1;
    yield 2;
  }
</script>

{#each items as item, i (item)}<b>{item}{i}</b>{/each}
{#each map as [key, value]}<b>{key}{value}</b>{/each}
{#each set as member}<b>{member}</b>{/each}
{#each str as ch}<b>{ch}</b>{/each}
{#each [...gen()] as produced}<b>{produced}</b>{/each}
{#each Object.entries({ z: 1 }) as [k, v]}<b>{k}{v}</b>{/each}
{#each { length: 2 } as slot}<b>{slot}</b>{:else}<b>empty</b>{/each}
