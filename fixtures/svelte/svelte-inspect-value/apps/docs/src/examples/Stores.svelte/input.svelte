<script lang="ts">
  import { Inspect } from '@components'
  import { onMount } from 'svelte'
  import type { InspectOptions } from 'svelte-inspect-value'
  import { readable, writable } from 'svelte/store'
  import { fromEvent, map, type Observable, startWith } from 'rxjs'

  let storesMode = $state<InspectOptions['stores']>('full')
  let clicksObservable = $state<Observable<unknown>>()

  function customStore(initialValue = 0) {
    let interval: number | undefined
    let val = writable(initialValue, () => {
      interval = window.setInterval(() => {
        val.update((n) => n + 1)
      }, 500)

      return () => {
        window.clearInterval(interval)
      }
    })

    return {
      ...val,
      set value(v: number) {
        val.set(v)
      },
    }
  }

  onMount(() => {
    clicksObservable = fromEvent(document.body, 'click').pipe(
      startWith(`0 clicks`),
      map((_, i) => `${i} clicks`)
    )
  })

  const stores = $derived({
    writableStore: writable('i am the store value'),
    test: writable('i am the\n store value'),
    readableStore: readable({ a: { b: { c: { d: { e: 'end' } } } } }),
    customStore: customStore(0),
    fakeStore: {
      subscribe: () => 'hi',
    },
  })
</script>

<Inspect
  class="not-content mt"
  values={{ ...stores, clicksObservable: clicksObservable }}
  expandLevel={0}
  stores={storesMode}
/>

<div class="input-row">
  <label>
    stores mode
    <select bind:value={storesMode}>
      <option value={false}>off (false)</option>
      <option>full</option>
      <option>value-only</option>
    </select>
  </label>
</div>
