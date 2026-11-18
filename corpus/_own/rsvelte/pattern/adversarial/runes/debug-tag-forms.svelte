<script>
  let a = $state(1);
  let b = $state({ inner: 2 });
  const c = $derived(a + b.inner);
</script>

{@debug}
{@debug a}
{@debug a, b}
{@debug a, b, c}

{#if a}
  {@debug a}
{/if}

{#each [a] as row}
  {@debug row}
{/each}

<b>{a}{b.inner}{c}</b>
