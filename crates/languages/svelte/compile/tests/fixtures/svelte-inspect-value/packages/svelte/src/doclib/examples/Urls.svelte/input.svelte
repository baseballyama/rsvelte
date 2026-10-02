<script lang="ts">
  import Inspect from '$lib/index.js'
  import { getContext } from 'svelte'
  import type { SvelteMap } from 'svelte/reactivity'

  getContext<SvelteMap<string, string>>('toc')?.set('URLs', 'urls')
</script>

<div class="flex col">
  <h3 id="urls">URLs</h3>

  <Inspect.Values.Expand0
    {...{
      url: new URL('https://subdomain.example.org/about'),
      fullyFeaturedUrl: new URL(
        'https://anon:hunter2@example.org:8080/pathname/index.html?q=query&p=123&buh#result'
      ),
      search: new URLSearchParams([
        ['a', '1'],
        ['a', '2'],
        ['b', '3'],
        ['b', '4'],
        ['c', '5'],
        ['query', 'elephants'],
      ]),
    }}
  />
</div>
