<script lang="ts">
  import Inspect from '$lib/index.js'
  import { generateNestedNeedle, type NestedStructure } from './haystack.js'

  let value = $state<NestedStructure>({})
  let maxDepth = $state(5)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const person = $state<Record<any, any>>({
    name: 'Bananaman',
    age: 36,
    cool: true,
    type: 'person',
  })

  let something = $state<unknown>(undefined)
  let otherStuff = $state({
    bananaMan: 'name',
    undefined: 'undefined',
    emptyString: ``,
    arr: [``],
    another_arr: [],
    dingle: new Map(),
    dongle: new Map([
      [1, 1],
      [2, 2],
    ]),
    bop: new Set(),
    bap: new Set([1, 2, 3]),
  })

  const vals = {
    a: undefined,
    b: null,
    c: true,
    d: 1,
    e: Symbol('something'),
    f: 'string',
  }

  let selectedOption = $state('a')
</script>

<button
  onclick={() => {
    value = generateNestedNeedle(maxDepth)
  }}>generate</button
>

<input type="number" bind:value={maxDepth} min="1" />

{#key value}
  <Inspect
    heading="find the needle in the haystack"
    name="haystack"
    values={value}
    expandLevel={0}
    showPreview={false}
    showLength={false}
    showTools={true}
  />
{/key}

<Inspect values={{ person, something, ...otherStuff }} expandLevel={0} heading="person" />

<label>
  name
  <input name="name" type="text" bind:value={person.name} />
</label>
<label>
  age
  <input name="name" type="number" bind:value={person.age} />
</label>
<label>
  cool
  <input type="checkbox" bind:checked={person.cool} />
</label>
<label>
  something
  <select
    bind:value={selectedOption}
    onchange={() => (something = vals[selectedOption as keyof typeof vals])}
  >
    {#each Object.entries(vals) as [key, value] (key)}
      <option value={key}>{String(value)}</option>
    {/each}
  </select>
</label>
