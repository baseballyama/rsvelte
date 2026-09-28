<script lang="ts">
  import Inspect, { type InspectProps } from 'svelte-inspect-value'

  import values from './values'
  import { globalOpts } from '@components/global-opts/globalopts.svelte'

  let props = $state<InspectProps>({
    noanimate: false,
    animRate: 1,
    flashOnUpdate: true,
  })

  let num = $state(0)

  $effect(() => {
    let int = window.setInterval(() => {
      num++
    }, 1200)

    return () => {
      window.clearInterval(int)
    }
  })
</script>

<Inspect
  heading
  {...props}
  class="not-content mt"
  theme={globalOpts.theme}
  borderless={globalOpts.borderless}
  values={{ ...values, updates: num, duration: (250 / props.animRate!).toFixed(2) + 'ms' }}
  expandLevel={0}
/>

<div class="input-row">
  <label>
    No Animation
    <input type="checkbox" bind:checked={props.noanimate} />
  </label>

  <label>
    Animation Rate
    <input min={0.25} step={0.25} type="number" bind:value={props.animRate} />
  </label>

  <label>
    Flash On Update
    <input type="checkbox" bind:checked={props.flashOnUpdate} />
  </label>
</div>
