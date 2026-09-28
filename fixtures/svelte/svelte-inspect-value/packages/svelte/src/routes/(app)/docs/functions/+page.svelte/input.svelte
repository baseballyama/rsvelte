<script lang="ts">
  import type { PageData } from './$types.js'

  let { data }: { data: PageData } = $props()

  const links = data.docs.map(({ type, title, children }) => ({
    title: title[1],
    href: `/docs/${type}/${title[1]}`,
    children,
  }))

  const types = links.filter((l) => l.href.includes('functions'))
</script>

<ul>
  <li>
    Types
    <ul>
      {#each types as { href, title } (href)}
        <li class="type">
          <a {href}>{title}()</a>
        </li>
      {/each}
    </ul>
  </li>
</ul>
