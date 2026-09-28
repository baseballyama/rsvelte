<script lang="ts">
  import { Inspect } from '$lib/index.js'
  import { getContext } from 'svelte'
  import type { SvelteMap } from 'svelte/reactivity'
  import Code from '../Code.svelte'
  import Stack from '../Stack.svelte'
  import rawCode from './gettersandsetters.txt?raw'

  let { code } = $props()

  let value = $state({
    name: {
      first: 'Ringo',
      last: 'Starr',
      get full() {
        return `${this.first} ${this.last}`
      },
      set firstName(value: string) {
        // eslint-disable-next-line no-console
        console.assert(typeof value === 'string')
        this.first = value
      },
    },
    value: 10,
    multiplier: 4.2,
    lastChecked: '',
    get current() {
      this.readValues.push(this.value)
      this.lastChecked = new Date().toUTCString()
      return this.value
    },
    set current(value) {
      if (typeof value !== 'number') throw 'not a number'
      this.value = value
    },
    get double() {
      this.readValues.push(this.value * 2)
      return this.value * 2
    },
    set currentMultiplier(value: number) {
      if (typeof value !== 'number') throw 'not a number'
      this.multiplier = value
    },
    get multiplied() {
      const result = this.value * this.multiplier
      this.readValues.push(result)
      return result
    },
    get lastReadValue() {
      return this.readValues.pop()
    },
    readValues: [] as number[],
    set errorSetter(value: unknown) {
      JSON.parse('{ invalid }')
    },
    get aPromise() {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(this.current)
        }, 1000)
      })
    },
  })

  getContext<SvelteMap<string, string>>('toc')?.set('Getters & Setters', 'getters')
</script>

<div class="flex col">
  <h3 id="getters">Getters and Setters</h3>
  <p>
    Getters and setters render as interactive nodes as to avoid executing potential side effects
    until they are manually called.<br />
    Setters can be called with valid JSON input.
  </p>

  <Stack>
    <Code code={rawCode}>
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html code}
    </Code>
    <Inspect name="gettersAndSetters" style="flex-basis: 50%" {value} />
  </Stack>
</div>
