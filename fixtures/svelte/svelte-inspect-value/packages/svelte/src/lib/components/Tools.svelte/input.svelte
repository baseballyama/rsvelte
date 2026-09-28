<script lang="ts">
  import { getContext } from 'svelte'
  import { globalInspectState } from '../Panel.svelte'
  import { getAddDestroyCallbackFn } from '../contexts.js'
  import { globalValues } from '../global.svelte.js'
  import { copyToClipBoard, logToConsole } from '../hello.svelte.js'
  import { useOptions } from '../options.svelte.js'
  import { useState, type NodeState } from '../state.svelte.js'
  import type { TypeViewProps } from '../types.js'
  import { isPromise, stringifyPath, wait } from '../util.js'
  import { buildSearchIndex } from '../util/search.js'
  import NodeIconButton from './NodeIconButton.svelte'
  import * as icons from './icons/index.js'

  type Props = Partial<TypeViewProps<unknown, string>> & { collapsed?: boolean }

  let { value, type = '', path = [] }: Props = $props()

  let copied = $state(false)

  const SIV_DEBUG = getContext<(() => boolean) | undefined>(Symbol.for('SIV.DEBUG'))
  const fixed = getContext(Symbol.for('siv.fixed'))
  const addOnDestroyCallback = getAddDestroyCallbackFn()
  let options = useOptions()
  let { onCopy, canCopy, onLog, showTools } = $derived(options.value)
  let inspectState = useState()
  let stringifiedPath = $derived(stringifyPath(path))
  let level = $derived(path.length)
  let settingCollapse = $state<false | 'collapsing' | 'expanding'>(false)

  let showCopyButton = $derived.by(() => {
    if (onCopy) {
      if (canCopy) return canCopy(value, type!, path)
      return true
    }

    return [
      'array',
      'object',
      'number',
      'bigint',
      'string',
      'undefined',
      'null',
      'date',
      'boolean',
    ].includes(type ?? '')
  })

  let nodeState = $derived(inspectState.value[stringifyPath(path)])

  let childNodes = $derived(
    Object.entries(inspectState.value).filter(
      ([k]) => k.startsWith(stringifiedPath) && k.split('.').length === level + 1
    )
  )
  let hasExpandedChildren = $derived(childNodes.some(([, state]) => !state.collapsed))
  let hasChildren = $derived(childNodes.length > 0)

  let copyTimeout = $state<number>()
  function onCopySuccess() {
    copied = true
    if (copyTimeout) window.clearTimeout(copyTimeout)
    copyTimeout = window.setTimeout(() => {
      copied = false
    }, 5000)
  }

  async function runCustomCopy() {
    let ret: ReturnType<NonNullable<typeof onCopy>>
    try {
      ret = onCopy!($state.snapshot(value), $state.snapshot(type!), $state.snapshot(path))
      if (isPromise(ret)) {
        const wasCopied = await ret
        if (wasCopied) onCopySuccess()
      } else if (typeof ret === 'boolean') {
        if (ret) onCopySuccess()
      }
    } catch (e) {
      console.error('[Inspect] error running custom onCopy callback:', e)
      copied = false
    }
  }

  async function copy() {
    if (onCopy) {
      runCustomCopy()
    } else {
      try {
        await copyToClipBoard(value, type)
        onCopySuccess()
      } catch (e) {
        console.error(e)
        copied = false
      }
    }
  }

  function log() {
    if (onLog) {
      onLog(value, type!, path)
    } else {
      logToConsole(path, value, type)
    }
  }

  type CollapseAction = {
    hint: string
    action: () => void | Promise<void>
    expand: boolean
  }

  const collapseAction: CollapseAction = {
    hint: 'Collapse children',
    action: async () => {
      settingCollapse = 'collapsing'
      for (const [path, state] of childNodes.toReversed()) {
        if (!state.collapsed) {
          inspectState.setCollapse(path, { collapsed: true })
          await wait()
        }
      }
      settingCollapse = false
    },
    expand: false,
  }

  const expandAction: CollapseAction = {
    hint: 'Expand children',
    action: async () => {
      settingCollapse = 'expanding'
      for (const [path, state] of childNodes) {
        if (state.collapsed) {
          inspectState.setCollapse(path, { collapsed: false })
          await wait()
        }
      }
      settingCollapse = false
    },
    expand: true,
  }

  let expandSelfAndChildrenAction: CollapseAction = {
    hint: 'Expand node and children',
    action: async () => {
      inspectState.setCollapse(stringifiedPath, { collapsed: false })
      expandAction.action()
    },
    expand: true,
  }

  function getTreeAction(nodeState: NodeState) {
    if (nodeState) {
      if (nodeState.collapsed) {
        return expandSelfAndChildrenAction
      }

      if (hasChildren) {
        return hasExpandedChildren ? collapseAction : expandAction
      }
    }

    return undefined
  }

  let treeAction = $derived(getTreeAction(nodeState))
  let panelValueAction = $derived.by(() => {
    if (globalInspectState.mounted.size) {
      if (globalValues.has(stringifiedPath)) {
        return {
          add: false,
          hint: 'Remove from panel',
          action: () => {
            globalValues.delete(stringifiedPath)
          },
        }
      } else if (!fixed) {
        return {
          add: true,
          hint: 'Add to panel',
          action: () => {
            globalValues.set(stringifiedPath, {
              get value() {
                return value
              },
              note: { title: 'Added manually' },
            })
            addOnDestroyCallback(() => {
              globalValues.delete(stringifiedPath)
            })
          },
        }
      }
    }
    return undefined
  })

  function debugNode() {
    const { log } = console
    log({
      globalInspectState,
      indexed: buildSearchIndex({ value, options: options.value }),
    })
  }
</script>

{#if showTools}
  <div class="tools">
    {#if SIV_DEBUG?.()}
      <NodeIconButton onclick={debugNode}>?</NodeIconButton>
    {/if}
    {#if panelValueAction}
      <NodeIconButton title={panelValueAction.hint} onclick={panelValueAction.action}>
        <icons.PanelValue add={panelValueAction.add} />
      </NodeIconButton>
    {/if}

    {#if treeAction}
      <NodeIconButton
        disabled={settingCollapse !== false}
        title={treeAction.hint}
        aria-label={treeAction.hint}
        onclick={treeAction.action}
      >
        <icons.ExpandCollapse expand={treeAction?.expand} setting={settingCollapse} />
      </NodeIconButton>
    {/if}
    <NodeIconButton
      title="Log value to console"
      aria-label="Log value to console"
      onclick={() => log()}
      style="font-size: 1em;width: 1.5em; height: 1.5em;"
    >
      <icons.Console />
    </NodeIconButton>
    {#if showCopyButton}
      <NodeIconButton
        title="Copy value to clipboard"
        aria-label="Copy value to clipboard"
        onclick={() => copy()}
        success={copied}
      >
        <icons.Clipboard {copied} />
      </NodeIconButton>
    {/if}
  </div>
{/if}

<style>
  .tools {
    display: flex;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;
    gap: 0.25em;
    opacity: 0;
    z-index: calc(var(--index) + 1);
    backdrop-filter: blur(1px);
    transition: opacity var(--__transition-duration) ease-in-out allow-discrete;
    border-left: 1px solid var(--_tools-border-color);
    background-color: var(--_tools-background-color);
    padding-inline: 0.5em;
    max-height: 1.5em;
    overflow: clip;
    font-size: 1em;
  }

  :global(.line:hover) .tools,
  :global(.line:focus-within) .tools {
    display: flex;
    opacity: 1;
    transition: opacity var(--__transition-duration) ease-in-out allow-discrete;
  }
</style>
