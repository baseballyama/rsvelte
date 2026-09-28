<script lang="ts">
  import type { SvelteHTMLElements } from 'svelte/elements'
  import { getPreviewLevel, setIsKey } from '../contexts.js'
  import { useOptions } from '../options.svelte.js'
  import type { TypeViewProps } from '../types.js'
  import { getType, stringify, stringifyPath } from '../util.js'
  import Node from './Node.svelte'
  import Type from './Type.svelte'

  import Highlight from './Highlight.svelte'

  type Props = {
    prefix?: string
    key: TypeViewProps<unknown>['key'] | unknown
    path?: TypeViewProps<unknown>['path']
    delim?: string
    disabled?: boolean
    allowUndefined?: boolean
  } & SvelteHTMLElements['span']

  let { key, path = [], delim = ':', prefix, disabled, onclick, ...rest }: Props = $props()

  const options = useOptions()
  const keyTypes = ['string', 'number', 'symbol', 'quotedstring']
  const simpleKeys = ['bigint', 'regexp']
  const shouldBeQuoted = /[^A-zÀ-ú0-9\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u024F_$]|[\\[\]`]/
  const previewLevel = getPreviewLevel()

  let keyType = $derived.by(() => {
    const t = getType(key)
    if (t === 'string') {
      if ((key as string).match(shouldBeQuoted) || key === '') {
        return 'quotedstring'
      }
      return t
    }
    return t
  })

  let display = $derived.by(() => {
    if (key != null) {
      if (keyType === 'quotedstring') {
        return stringify(key, undefined, options.value.quotes)
      }
      return key.toString()
    }
    return key
  })

  let shouldShow = $derived(key === undefined ? previewLevel > 0 : true)

  function onerror(error: unknown): void {
    throw new Error('Error in Key.svelte', { cause: error })
  }
  setIsKey()
</script>

{#if shouldShow}
  <svelte:boundary {onerror}>
    <div class="key-and-delimiter">
      <div
        data-testid="key"
        class={['key-outer', disabled && 'disabled']}
        aria-label={key?.toString()}
        title={stringifyPath(path)}
        data-search-ignore={previewLevel > 0 ? '' : undefined}
        {...rest}
      >
        {#if prefix}
          <span class="prefix">{prefix}</span>
        {/if}
        {#if keyTypes.includes(keyType)}
          <span class={['key', keyType, disabled && 'disabled']}>
            {#if keyType === 'quotedstring' && key !== ''}
              {#each display as string as char, i (i)}
                {#if char === ' '}
                  <span class="whitespace">&sdot;</span>
                {:else}
                  {char}
                {/if}
              {/each}
            {:else}
              <Highlight
                value={display?.toString() ?? ''}
                fields={['key', 'path']}
                alsoMatch={stringifyPath(path)}
              />
            {/if}
          </span>
        {:else if simpleKeys.includes(keyType)}
          <Node value={key} />
        {:else}
          <Type type={keyType} force />
        {/if}
      </div>
      {#if delim}
        <span class="delim">{delim}</span>
      {/if}
    </div>
  </svelte:boundary>
{/if}

<style>
  .key-and-delimiter {
    display: flex;
  }

  .key-outer {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5em;
    margin: 0;
    padding: 0;

    &:focus:not(.disabled),
    &:hover:not(.disabled) {
      .key {
        text-decoration: underline;
        text-decoration-color: color-mix(in srgb, currentColor, transparent 50%);
      }
    }
  }

  .whitespace {
    opacity: var(--_key-whitespace-opacity);
    color: var(--_key-whitespace-color);
    user-select: none;
  }

  .key {
    display: flex;
    justify-content: center;
    align-items: center;
    transition:
      color var(--__transition-duration) ease-in-out,
      text-decoration-color var(--__transition-duration) ease-in-out;
    height: 100%;
    user-select: text;
    text-decoration: underline;
    text-decoration-color: transparent;

    &.number {
      color: var(--_number-value-color);
    }

    &.string {
      color: var(--_text-color);
    }

    &.symbol {
      color: var(--_symbol-value-color);
    }

    &.quotedstring {
      color: var(--_string-value-color);
      text-wrap: nowrap;
      white-space: pre !important;
      white-space-collapse: preserve-spaces;
    }
  }

  .delim {
    color: var(--_delimiter-color);
    user-select: text;
  }

  .prefix {
    color: var(--_key-prefix-color);
    font-weight: 900;
  }
</style>
