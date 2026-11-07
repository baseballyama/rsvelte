<script lang="ts">
  import { DEV } from 'esm-env'
  import type { Snippet } from 'svelte'

  const { children }: { children?: Snippet } = $props()
</script>

{#if DEV && children}
  {@render children()}
{/if}
