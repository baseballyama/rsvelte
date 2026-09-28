<script lang="ts">
  import _Inspect from '$lib/index.js'
  import { getContext } from 'svelte'
  import type { SvelteMap } from 'svelte/reactivity'
  import Code from '../Code.svelte'
  import Stack from '../Stack.svelte'
  import rawCode from './iterators.txt?raw'

  let { code } = $props()

  function* fibonacci() {
    let current = 1
    let next = 1
    while (true) {
      yield current
      ;[current, next] = [next, current + next]
    }
  }

  async function* suspensefulFibonacci() {
    let current = 1
    let next = 1
    while (true) {
      await new Promise((resolve) => {
        setTimeout(
          () => {
            resolve(undefined)
          },
          Math.ceil(Math.random() * 1000)
        )
      })
      yield current
      ;[current, next] = [next, current + next]
    }
  }

  let iterators = $state({
    fibonacci: fibonacci(),
    suspensefulFibonacci: suspensefulFibonacci(),
    array: [1, 2, 3, 4].values(),
    set: new Set([12, 34, 45]).values(),
    map: new Map<unknown, unknown>([
      [0, 0],
      [{ id: 123 }, 1],
      [[1, 2, 3], 2],
      [Symbol('key'), 'value'],
      [
        Promise.resolve('foo'),
        {
          get something() {
            return 'something'
          },
        },
      ],
    ]).entries(),
    stringIterator: 'abdcdefghijklmnopqrstuvwxyzæøå'[Symbol.iterator](),
  })

  getContext<SvelteMap<string, string>>('toc')?.set('Iterators & Generators', 'iterators')

  const Inspect = _Inspect.Values.withOptions(() => ({
    expandLevel: 0,
    previewDepth: 20,
    previewEntries: Infinity,
  }))
</script>

<div class="flex col">
  <h3 id="iterators">Iterators & Generators</h3>
  <p>Iterators have to be iterated manually since doing so directly affects the source iterator.</p>

  <Stack>
    <Code code={rawCode}>
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html code}
    </Code>
    <div style="flex-basis: 50%">
      <Inspect {...iterators} />
    </div>
  </Stack>
</div>
