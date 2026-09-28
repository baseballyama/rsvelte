<script lang="ts">
  import Inspect from '@components/Inspect.svelte'
  import { globalOpts } from '@components/global-opts/globalopts.svelte.js'
  import type { InspectProps } from 'svelte-inspect-value'

  let { seeFlashing = $bindable(false), ...props }: InspectProps & { seeFlashing?: boolean } =
    $props()

  $effect(() => {
    const interval = window.setInterval(() => {
      if (seeFlashing) values.age++
    }, 2000)

    return () => window.clearInterval(interval)
  })

  const allTypesSearch = $derived.by(() => {
    if (globalOpts?.search === false) {
      return 'highlight'
    }
    return globalOpts?.search ?? undefined
  })

  let values = $state({
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
  })
</script>

<Inspect class="not-content mt" {...props} {values} search={allTypesSearch} expandLevel={0}>
  {#snippet heading(collapsed: boolean)}
    {#if !collapsed}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <label
        onclick={(e) => {
          e.stopPropagation()
        }}
      >
        increment number
        <input type="checkbox" bind:checked={seeFlashing} />
      </label>
    {/if}
  {/snippet}
</Inspect>

<style>
  label {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 1ch;
    margin: 0 !important;
    width: 100%;
    font-size: 0.8em;
  }
</style>
