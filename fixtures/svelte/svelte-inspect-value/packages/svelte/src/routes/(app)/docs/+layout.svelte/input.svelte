<script lang="ts">
  import { page } from '$app/state'
  import { addToPanel } from '$lib/global.svelte.js'
  import type { Snippet } from 'svelte'
  import { fly } from 'svelte/transition'
  import type { LayoutData } from './$types.js'

  let { data, children }: { data: LayoutData; children: Snippet } = $props()

  const links = data.docs.map(({ type, title, children }) => ({
    title: title[1],
    href: `/docs/${type}/${title[1]}`,
    children,
  }))

  addToPanel('links', () => links)

  const fns = links.filter((l) => l.href.includes('functions'))
  const types = links.filter((l) => l.href.includes('types'))
  const vars = links.filter((l) => l.href.includes('variables'))
  const modules = links.filter((l) => l.href.includes('modules'))
</script>

<ul style="display: none">
  <li>
    Modules
    <ul>
      {#each modules as { href, title } (href)}
        <li class="var">
          <a {href}>{title}</a>
        </li>
      {/each}
    </ul>
  </li>
  <li>
    Variables
    <ul>
      {#each vars as { href, title } (href)}
        <li class="var">
          <a {href}>{title}</a>
        </li>
      {/each}
    </ul>
  </li>
  <li>
    Types
    <ul>
      {#each types as { href, title } (href)}
        <li class="type">
          <a {href}>{title}</a>
        </li>
      {/each}
    </ul>
  </li>
  {#each fns as { href, title } (href)}
    <li>
      <a {href}><span class="fn">{title}</span>()</a>
    </li>
  {/each}
</ul>

{#key page.data}
  <div class="md-types" in:fly={{ x: -10 }}>
    {@render children()}
  </div>
{/key}

<style>
  ul {
    border-radius: 8px;
    background-color: var(--bg);
    font-size: 12px;
    font-family: monospace;

    a {
      text-decoration: none;
    }

    .type a {
      color: var(--class);
    }
    .fn {
      color: var(--function);
    }
  }

  li {
    list-style: none;
  }
</style>
