<script lang="ts">
  import Inspect, { type InspectProps } from 'svelte-inspect-value'

  import values from './values'
  import { globalOpts } from '@components/global-opts/globalopts.svelte'

  let props = $state<InspectProps>({
    previewDepth: 1,
    previewEntries: 3,
  })
</script>

<Inspect
  {...props}
  class="not-content mt"
  theme={globalOpts.theme}
  borderless={globalOpts.borderless}
  {values}
  showPreview
  expandLevel={0}
/>

<div class="input-row">
  <label>
    Depth
    <input type="number" bind:value={props.previewDepth} />
  </label>
  <label>
    Entries
    <input type="number" bind:value={props.previewEntries} />
  </label>
</div>

<style>
  input {
    max-width: 4em;
  }
</style>
