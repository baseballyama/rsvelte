<script lang="ts">
  const x = 1;
</script>

{#snippet row({
  name,
}: {
  // it's a comment
  name: string;
})}
  <p>{name}{x}</p>
{/snippet}

{@render row({ name: 'a' })}
