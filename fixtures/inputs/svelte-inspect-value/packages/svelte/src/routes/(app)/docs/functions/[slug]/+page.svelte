<script lang="ts">
  import { createPageTitle } from '$doclib/util.js'
  import type { PageData } from './$types.js'

  let { data }: { data: PageData } = $props()

  const title = $derived(data.meta?.title?.[1])
</script>

<svelte:head>
  <title>{createPageTitle(title ? `fn ${title}()` : 'Function')}</title>
</svelte:head>

<data.content />
