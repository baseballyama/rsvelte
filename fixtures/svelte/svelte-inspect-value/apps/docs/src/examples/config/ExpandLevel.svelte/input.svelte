<script lang="ts">
  import Inspect, { type InspectProps } from 'svelte-inspect-value'

  import values from './values'
  import { globalOpts } from '@components/global-opts/globalopts.svelte'

  let expandLevel = $state(0)
  let expandPaths = $state<NonNullable<InspectProps['expandPaths']>>([])
  let display = $state(0)

  let props = $derived<InspectProps>({
    expandLevel,
    expandPaths,
  })
</script>

<div class="input-row">
  <label>
    expandLevel
    <input
      min={0}
      max={30}
      type="number"
      value={expandLevel}
      onchange={(e) => {
        const value = e.currentTarget.valueAsNumber
        expandLevel = value
        display++
      }}
    />
  </label>
  <label>
    Set expandPaths
    <input
      type="checkbox"
      checked={Boolean(expandPaths.length)}
      onchange={(e) => {
        const checked = e.currentTarget.checked

        if (checked) {
          expandLevel = 0
          expandPaths = ['levelOne.levelTwo.levelThree', 'arr.0.0']
        } else {
          expandPaths = []
        }

        display++
      }}
    />
  </label>
</div>

{#key display}
  <Inspect
    {...props}
    class="not-content mt"
    theme={globalOpts.theme}
    borderless={globalOpts.borderless}
    values={{
      arr: values.veryNested,
      levelOne: {
        a: 'a',
        b: 'b',
        levelTwo: { a: 'a', b: 'b', levelThree: { a: 'a', b: 'b', levelFour: { msg: 'end' } } },
      },
      expandPathsValue: expandPaths,
    }}
    showPreview
  />
{/key}

<style>
  input {
    max-width: 4em;
  }
</style>
