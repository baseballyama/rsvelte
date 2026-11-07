<script
  lang="ts"
  generics="V extends Record<PropertyKey, unknown> | List = Record<PropertyKey, unknown> | List, K extends keyof V = keyof V"
>
  import { getContext, setContext } from 'svelte'
  import type { HTMLButtonAttributes, SvelteHTMLElements } from 'svelte/elements'
  import { useOptions } from '../options.svelte.js'
  import type { List, TypeViewProps } from '../types.js'
  import { getPropertyDescriptor, getType } from '../util.js'
  import GetterSetter from './GetterSetter.svelte'
  import Key from './Key.svelte'
  import Node from './Node.svelte'
  import NodeActionButton from './NodeActionButton.svelte'
  import Type from './Type.svelte'
  import { fly, slide } from '../transition/index.js'

  type PreviewProps = {
    prefix?: string
    postfix?: string
    list?: List
    keyValue?: [PropertyKey, unknown][]
    keys?: K[]
    value?: V
    singleValue?: { value: unknown }
    startLevel?: number
    showPreview?: boolean
    path?: TypeViewProps['path']
    keyDelim?: string
    keyStyle?: HTMLButtonAttributes['style']
    showKey?: boolean
    bracketStyle?: string
    usedefaults?: boolean
  } & SvelteHTMLElements['div']

  let {
    value,
    list: previewList,
    keyValue: previewKeyValue,
    keys: previewKeys,
    singleValue,
    path,
    prefix,
    postfix,
    showKey = true,
    keyDelim = ':',
    keyStyle = '',
    startLevel = 1,
    showPreview = false,
    class: classValue,
    bracketStyle = '',
    usedefaults,
    ...rest
  }: PreviewProps = $props()

  // svelte-ignore state_referenced_locally TODO
  const previewLevel = getContext<number | undefined>(Symbol.for('siv.preview-level')) ?? startLevel
  const options = useOptions()
  let {
    previewEntries,
    previewDepth,
    showPreview: optsShowPreview,
    easing,
  } = $derived(options.value)

  setContext(Symbol.for('siv.preview-level'), (previewLevel ?? 0) + 1)

  let list = $derived(previewList?.slice(0, previewEntries))
  let keyValue = $derived(previewKeyValue?.slice(0, previewEntries))
  let keys = $derived(previewKeys?.slice(0, previewEntries))

  let hasMore = $derived.by(() => {
    if (list && previewList) {
      return list.length < previewList.length
    } else if (keyValue && previewKeyValue) {
      return keyValue.length < previewKeyValue.length
    } else if (keys && previewKeys) {
      return keys.length < previewKeys.length
    }
    return false
  })

  function alwaysRender(type: string) {
    return [
      'boolean',
      'string',
      'number',
      'bigint',
      'symbol',
      'regexp',
      'class',
      'undefined',
      'null',
      'store',
    ].includes(type)
  }
</script>

{#if optsShowPreview && previewEntries > 0 && showPreview}
  <svelte:boundary onerror={(e) => console.error('preview failed:', e)}>
    {#snippet failed(_, reset)}
      preview error. check console
      <NodeActionButton onclick={reset}>reset</NodeActionButton>
    {/snippet}
    <div
      data-testid="preview"
      class={['preview', classValue]}
      transition:slide={{
        axis: 'x',
        duration: options.transitionDuration,
        easing,
      }}
      {...rest}
    >
      {#if prefix}
        <span class="pre level-{previewLevel}" style={bracketStyle}>{prefix}</span>
      {/if}
      <div
        class="inner"
        transition:fly={{
          y: 20,
          duration: options.transitionDuration,
          easing,
        }}
      >
        {#if keys && value}
          {#each keys as key, i (i)}
            {@const descriptor = getPropertyDescriptor(value, key)}
            {@render previewValue(
              key,
              false,
              descriptor
            )}{#if i < keys.length - 1}{@render comma()}{/if}
          {/each}
        {:else if keyValue}
          {#each keyValue as [key, value], i (key)}
            {@render valuePreview(value, key)}{#if i < keyValue.length - 1}{@render comma()}{/if}
          {/each}
        {:else if list}
          {#each list as value, i (i)}
            {@render valuePreview(value, i)}{#if i < list.length - 1}{@render comma()}{/if}
          {/each}
        {:else if singleValue}
          {@render valuePreview(singleValue.value, undefined)}
        {/if}
      </div>
      {#if hasMore}{@render comma()}<span class="ellipsis">&hellip;</span>{/if}
      {#if postfix}
        <span class="post level-{previewLevel}" style={bracketStyle}>{postfix}</span>
      {/if}
    </div>
  </svelte:boundary>
{/if}

<!-- At configured previewDepth, stop rendering nested item previews and just render their types -->
{#snippet valuePreview(value: unknown, key?: PropertyKey)}
  {@const valType = getType(value, options.value.stores)}
  {@const newPath = path && key ? [...path, key] : undefined}
  {#if alwaysRender(valType) || previewLevel < previewDepth}
    <Node {path} {key} {value} {showKey} {keyDelim} {keyStyle} {usedefaults} />
  {:else}
    <div class="key-type-preview">
      {#if showKey}
        <Key disabled path={newPath} {key} delim={keyDelim} style={keyStyle} allowUndefined />
      {/if}
      <Type type={valType} force />
    </div>
  {/if}
{/snippet}

{#snippet previewValue(key: K, _force = false, descriptor?: PropertyDescriptor)}
  {#if descriptor?.set || descriptor?.get}
    <GetterSetter {key} {descriptor} {value} {path} />
  {:else}
    {@render valuePreview(value?.[key], key)}
  {/if}
{/snippet}

{#snippet comma()}
  <span class="comma">,</span>
{/snippet}

<style>
  .comma {
    margin-right: 0.5em;
    margin-left: 0;
    color: var(--_text-color);
  }

  .ellipsis {
    color: var(--_preview-ellipsis-color);
  }

  .preview {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    transform-origin: bottom right;
    min-width: 0;
    overflow: hidden;
    color: var(--_text-color);
    font-size: var(--inspect-font-size);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .inner {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .key-type-preview {
    display: inline-flex;
    justify-content: flex-start;
    align-items: center;
    gap: 0.25em;
  }

  .pre {
    margin-right: 0.25em;
  }

  .post {
    margin-left: 0.25em;
  }

  .pre,
  .post {
    color: var(--_text-color);

    &.level-0 {
      color: var(--_comment-color);
    }
    &.level-1 {
      color: var(--_text-color);
    }
    &.level-2 {
      color: var(--green);
    }
    &.level-3 {
      color: var(--blue);
    }
    &.level-4 {
      color: var(--red);
    }
    &.level-5 {
      color: var(--green);
    }
    &.level-6 {
      color: var(--blue);
    }
    &.level-7 {
      color: var(--red);
    }
    &.level-8 {
      color: var(--green);
    }
    &.level-9 {
      color: var(--blue);
    }
    &.level-10 {
      color: var(--red);
    }
    &.level-11 {
      color: var(--green);
    }
    &.level-12 {
      color: var(--blue);
    }
    &.level-13 {
      color: var(--red);
    }
    &.level-14 {
      color: var(--green);
    }
    &.level-15 {
      color: var(--blue);
    }
    &.level-16 {
      color: var(--red);
    }
    &.level-17 {
      color: var(--green);
    }
    &.level-18 {
      color: var(--blue);
    }
    &.level-19 {
      color: var(--red);
    }
  }
</style>
