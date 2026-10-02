<script lang="ts">
  import Inspect from 'svelte-inspect-value'

  import values from './values'
  import { globalOpts } from '@components/global-opts/globalopts.svelte'

  let shouldRender = $state(true)

  let renderIf = () => shouldRender
</script>

<div class="cnt">
  <Inspect
    {renderIf}
    class="not-content mt"
    theme={globalOpts.theme}
    borderless={globalOpts.borderless}
    {values}
    expandLevel={0}
  />
</div>

<div class="input-row">
  <label>
    Should Render
    <input type="checkbox" bind:checked={shouldRender} />
  </label>
</div>

<style>
  .cnt {
    height: 270px;
    max-height: 270px;
    overflow: hidden;
  }
</style>
