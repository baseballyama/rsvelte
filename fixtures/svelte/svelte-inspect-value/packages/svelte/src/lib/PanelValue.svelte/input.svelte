<script lang="ts">
  import NodeActionButton from './components/NodeActionButton.svelte'
  import { addToPanel, globalValues } from './global.svelte.js'
  import { globalInspectState } from './Panel.svelte'
  import Wrapper from './Wrapper.svelte'

  type Props = {
    value?: unknown
    key: PropertyKey
    label?: string
    renderIf?: boolean
  }

  let { key, value, label = 'PanelValue', renderIf = false }: Props = $props()

  $effect(() => {
    const remove = addToPanel(key, () => value, label)

    return remove
  })

  function setAsPanelValue() {
    globalValues.set(key, { value: () => value, note: { title: 'Added manually' } })
  }
</script>

{#if Boolean(renderIf)}
  <Wrapper class={['borderless']} style="max-width: 2em; min-width: 2em;">
    <div style="padding: 2px;">
      {#if !globalValues.has(key) && globalInspectState.mounted.size}
        <NodeActionButton title="Add to panel" onclick={setAsPanelValue}>+</NodeActionButton>
      {/if}
      {#if globalValues.has(key)}
        <NodeActionButton title="Remove from panel" onclick={() => globalValues.delete(key)}
          >-</NodeActionButton
        >
      {/if}
    </div>
  </Wrapper>
{/if}
