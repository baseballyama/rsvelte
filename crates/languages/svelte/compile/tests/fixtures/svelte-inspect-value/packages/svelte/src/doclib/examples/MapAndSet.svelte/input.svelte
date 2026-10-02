<script lang="ts">
  import Inspect from '$lib/Inspect.svelte'
  import { getContext } from 'svelte'
  import type { SvelteMap } from 'svelte/reactivity'

  getContext<SvelteMap<string, string>>('toc')?.set('Map & Set', 'map-and-set')
</script>

<div class="flex col">
  <h3 id="map-and-set">Map & Set</h3>
  <p><code>Inspect</code> handles map and set instances.</p>

  <Inspect
    style="width: 500px"
    value={{
      map: new Map<unknown, unknown>([
        ['yeah', 1],
        [3, 2],
        [{ name: 'object key' }, 3],
        [[1, 2], 3],
        [Symbol('1'), 4],
        [/r(e+)gExp?/, 'regex key'],
      ]),
      set: new Set([1, 2, 3, 'four']),
    }}
    name="mapAndSet"
  />
</div>
