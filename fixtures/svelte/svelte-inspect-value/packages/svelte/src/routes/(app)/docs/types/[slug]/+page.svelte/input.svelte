<script lang="ts">
  import { createPageTitle } from '$doclib/util.js'
  import type { PageData } from './$types.js'

  let { data }: { data: PageData } = $props()

  const title = $derived(data.meta?.title?.[1])
</script>

<svelte:head>
  <title>{createPageTitle(title ? `type ${title}` : 'Type')}</title>
</svelte:head>

{#if data.meta.children}
  <div class="toc">
    {#if data.meta.title}
      <a href="#{data.meta.title[0]}" style="font-weight: bold;">{data.meta.title[1]}</a>
    {/if}
    {#each data.meta.children as [id, title] (id)}
      <a href="#{id}">- {title}</a>
      <hr />
    {/each}
  </div>
{/if}

<data.content />
