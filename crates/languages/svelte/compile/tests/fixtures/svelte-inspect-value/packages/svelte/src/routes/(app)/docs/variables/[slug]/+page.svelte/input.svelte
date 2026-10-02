<script lang="ts">
  import type { PageData } from './$types.js'

  let { data }: { data: PageData } = $props()
</script>

{#if data.meta.children}
  <div class="toc">
    {#each data.meta.children as [id, title] (id)}
      <a href="#{id}">{title}</a>
      <hr />
    {/each}
  </div>
{/if}

<data.content />
