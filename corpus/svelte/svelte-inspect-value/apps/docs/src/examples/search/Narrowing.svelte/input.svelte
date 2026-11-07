<script lang="ts">
  import { onMount } from 'svelte'

  // import { onMount } from 'svelte'
  import { type InspectOptions } from 'svelte-inspect-value'
  import { Inspect } from '@components'

  let ins = $state<ReturnType<typeof Inspect>>()
  let search = $state<InspectOptions['search']>('highlight')
  let highlightMatches = $state(true)

  const value = {
    id: undefined,
    firstName: 'Bob',
    lastName: 'Alice',
    email: 'bob@alice.lol',
    introduction: `The name is Alice.

    Bob Alice.`,
    birthDate: new Date(),
    website: new URL('https://alicebob.website/?ref=abcdefg#about'),
    age: -42,
    emailVerified: true,
    interests: ['radio', 'tv', 'internet', 'kayaks'],
    nilVals: [undefined, null, NaN, Infinity],
    get interestList() {
      return this.interests.join('\n')
    },
    doStuff() {
      if (this.emailVerified) {
        return this.email
      } else {
        throw 'can not do stuff if email not verified'
      }
    },
  }

  onMount(() => {
    if (ins) {
      ins.search('value:"radio" key:name type:bool')
    }
  })
</script>

<div class="search-example">
  <Inspect
    bind:this={ins}
    values={value}
    expandLevel={0}
    heading="Search Demo"
    searchMode="or"
    {search}
    {highlightMatches}
    class="not-content"
    style="margin-top: 0 !important;"
  />

  <div class="not-content input-row">
    <label>
      Search mode
      <select bind:value={search}>
        <option>highlight</option>
        <option>filter</option>
        <option>filter-strict</option>
      </select>
    </label>
    <label>
      Highlight matches
      <input type="checkbox" bind:checked={highlightMatches} />
    </label>
  </div>
</div>

<style>
  .input-row {
    display: flex;
    gap: 1em;
    font-family: monospace;
  }

  .search-example {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    border-radius: 8px;
    background-color: var(--sl-color-gray-6);
    padding: 0.5rem;
    height: 555px;
  }
</style>
