<script lang="ts">
  import NodeIconButton from './components/NodeIconButton.svelte'
  import Select from './components/Select.svelte'
  import * as icons from './components/icons/index.js'
  import type { PanelAppearance, PanelSettings, XPos, YPos } from './types.js'

  type VoidCallback = () => void

  type ToolbarProps = {
    fullScreen: boolean
    opacity: boolean
    xPos: XPos
    yPos: YPos
    appearance: PanelAppearance
    showResetButton: boolean
    onAlignChange: (xPos: XPos, yPos: YPos) => void
    settingsChanged: (keys: (keyof PanelSettings)[]) => void
    toggleOpacity: VoidCallback
    onReset: VoidCallback
  }

  let {
    fullScreen = $bindable(false),
    opacity,
    xPos,
    yPos,
    appearance = $bindable('solid'),
    showResetButton,
    onReset,
    toggleOpacity,
    settingsChanged,
    onAlignChange,
  }: ToolbarProps = $props()
</script>

<div class={['toolbar', yPos]}>
  <div class="group">
    <NodeIconButton title="Toggle full view" onclick={() => (fullScreen = !fullScreen)}>
      {#if fullScreen}
        <icons.FullscreenExit />
      {:else}
        <icons.Fullscreen />
      {/if}
    </NodeIconButton>
    {#if !fullScreen}
      <NodeIconButton title="Toggle opacity" onclick={toggleOpacity}>
        {#if opacity}
          <icons.Opacity />
        {:else}
          <icons.Circle />
        {/if}
      </NodeIconButton>
    {/if}
    {#if showResetButton}
      <NodeIconButton title="Reset size" onclick={onReset}>
        <icons.ResetResize />
      </NodeIconButton>
    {/if}
  </div>

  <div class="group">
    {#if !fullScreen}
      <Select
        prefix="x"
        name="x-position"
        title="Set x-position"
        value={xPos}
        onchange={(e) => onAlignChange(e.currentTarget.value as XPos, yPos)}
      >
        <option>left</option>
        <option disabled={['middle', 'full'].includes(yPos)}>center</option>
        <option>right</option>
        <option disabled={['middle', 'full'].includes(yPos)}>full</option>
      </Select>

      <Select
        prefix="y"
        name="y-position"
        title="Set y-position"
        value={yPos}
        onchange={(e) => onAlignChange(xPos, e.currentTarget.value as YPos)}
      >
        <option>top</option>
        <option disabled={['full', 'center'].includes(xPos)}>middle</option>
        <option>bottom</option>
        <option disabled={['center', 'full'].includes(xPos)}>full</option>
      </Select>
    {/if}
    <Select
      bind:value={appearance}
      name="appearance"
      onchange={() => settingsChanged(['appearance'])}
    >
      <option>solid</option>
      <option>dense</option>
      <option>glassy</option>
      <option>floating</option>
    </Select>
  </div>
</div>

<style>
  .toolbar {
    display: flex;
    flex-shrink: 0;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 0.5em;
    box-sizing: border-box;
    border: 1px solid var(--_border-color);
    border-radius: 8px;
    background-color: var(--_background-color);
    padding: 0.375em 0.5em;
    width: 100%;
    min-height: 2em;
    overflow: auto;

    .group {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 0.5em;
    }

    @container (inline-size < 220px) {
      gap: 0.25;

      .group {
        justify-content: flex-end;
        gap: 0.25em;
        width: 100%;
      }
    }
  }
</style>
