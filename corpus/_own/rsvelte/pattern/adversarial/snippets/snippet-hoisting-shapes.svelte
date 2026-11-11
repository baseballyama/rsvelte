<script>
  let n = $state(1);
  const constant = 2;
</script>

{#snippet pure()}
  <b>static</b>
{/snippet}

{#snippet readsModuleConst()}
  <b>{constant}</b>
{/snippet}

{#snippet readsState()}
  <b>{n}</b>
{/snippet}

{#snippet takesParam(value)}
  <b>{value}</b>
{/snippet}

{#snippet callsAnother()}
  {@render pure()}
  {@render takesParam(constant)}
{/snippet}

{@render pure()}
{@render readsModuleConst()}
{@render readsState()}
{@render callsAnother()}
