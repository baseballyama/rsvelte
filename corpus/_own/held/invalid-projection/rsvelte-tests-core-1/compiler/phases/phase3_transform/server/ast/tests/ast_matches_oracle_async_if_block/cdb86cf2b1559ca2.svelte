<script>
  function complex1() {
    return 1;
  }

  let foo = $state(true);
  let blocking = $derived(await foo);
</script>

{#if foo}
  foo
{:else if bar}
  bar
{:else}
  else
{/if}

{#if await foo}
  foo
{:else if bar}
  bar
{:else if await baz}
  baz
{:else}
  else
{/if}

{#if await foo > 10}
  foo
{:else if bar}
  bar
{:else if await foo > 5}
  baz
{:else}
  else
{/if}

{#if simple1}
  foo
{:else if simple2 > 10}
  bar
{:else if complex1() * complex2 > 100}
  baz
{:else}
  else
{/if}

{#if blocking > 10}
  foo
{:else if blocking > 5}
  bar
{:else}
  else
{/if}
