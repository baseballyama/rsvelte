<script lang="ts">
  import type { PageData } from './$types.js'

  let { data }: { data: PageData } = $props()

  const links = data.docs.map(({ type, title, children }) => ({
    title: title[1],
    href: `/docs/${type}/${title[1]}`,
    children,
  }))

  const types = links.filter((l) => l.href.includes('types'))
  const functions = links.filter((l) => l.href.includes('functions'))
  const variables = links.filter((l) => l.href.includes('variables'))
</script>

<ul>
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
  <li>
    Functions
    <ul>
      {#each functions as { href, title } (href)}
        <li class="type">
          <a {href}>{title}</a>
        </li>
      {/each}
    </ul>
  </li>
  <li>
    Variables
    <ul>
      {#each variables as { href, title } (href)}
        <li class="type">
          <a {href}>{title}</a>
        </li>
      {/each}
    </ul>
  </li>
</ul>
