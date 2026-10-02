<script lang="ts">
  import Inspect, { type InspectProps } from 'svelte-inspect-value'

  import values from './values'
  import { globalOpts } from '@components/global-opts/globalopts.svelte'

  let props = $state<InspectProps>({
    showLength: true,
    showPreview: true,
    showTools: true,
    showTypes: true,
  })
</script>

<Inspect
  {...props}
  class="not-content mt"
  theme={globalOpts.theme}
  borderless={globalOpts.borderless}
  {values}
  expandLevel={0}
/>

<div class="input-row">
  <label>
    Lengths
    <input type="checkbox" bind:checked={props.showLength} />
  </label>
  <label>
    Types
    <input type="checkbox" bind:checked={props.showTypes} />
  </label>
  <label>
    Tools
    <input type="checkbox" bind:checked={props.showTools} />
  </label>
  <label>
    Preview
    <input type="checkbox" bind:checked={props.showPreview} />
  </label>
</div>
