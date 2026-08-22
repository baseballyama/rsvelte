<script>
  let v = $state(1);
</script>

{#snippet root(text)}
  <b>{text}</b>
{/snippet}

{#snippet node(fragment)}
  <b>{fragment}</b>
{/snippet}

{#snippet anchor()}
  <b>{v}</b>
{/snippet}

{@render root(v)}
{@render node(v)}
{@render anchor()}
