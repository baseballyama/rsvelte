<script module lang="ts">
  import memoize from 'memoize'
  import { highlightText } from '../util/highlight-text.js'

  const hl = memoize(highlightText, {
    cacheKey: ([text, terms]) => text + terms.map((term) => term.value).join(''),
  })
</script>

<script lang="ts">
  import type { SvelteHTMLElements } from 'svelte/elements'
  import { useSearchContext } from '../contexts.js'
  import { useOptions } from '../options.svelte.js'

  type Props = {
    value: string
    fields?: ('type' | 'path' | 'key' | 'any' | 'value')[]
    alsoMatch?: string
  } & SvelteHTMLElements['span']

  let { value: text, fields = ['any'], alsoMatch, class: className, ...rest }: Props = $props()
  const searchCtx = useSearchContext()
  const options = useOptions()
  const { query, matchingPaths, terms } = $derived(searchCtx())
  const { highlightMatches, search } = $derived(options.value)

  let chunks = $derived.by(() => {
    if (terms.length && highlightMatches && search) {
      try {
        return hl(
          text,
          terms.filter(
            (term) => term.value.length > 1 && (fields.includes(term.field) || term.field === 'any')
          )
        )
      } catch (e) {
        console.error(e)
        return []
      }
    }
    return []
  })

  let altMatch = $derived.by<'full' | 'partial' | false>(() => {
    const term = terms[0]
    if (matchingPaths.length > 0) return false

    if (highlightMatches && search && term && alsoMatch != null && term.value.length > 1) {
      if (term.field !== 'any' && fields.length && !fields.includes(term.field)) return false
      const fullMatch = alsoMatch.toLowerCase() === term.value.toLowerCase()

      if (term.exact) {
        return fullMatch ? 'full' : false
      }
      const partialMatch = alsoMatch.toLowerCase().includes(term.value.toLowerCase())

      return fullMatch ? 'full' : partialMatch ? 'partial' : false
    }
    return false
  })
</script>

{#if highlightMatches && query.length > 1 && chunks.some((c) => c.match)}
  <span aria-label={text} class={className} {...rest}>
    {#each chunks as chunk (chunk.start)}
      <svelte:element
        this={chunk.match ? 'mark' : 'span'}
        aria-hidden="true"
        class={['can-match', chunk.match && 'highlight chunk']}
      >
        {chunk.text}
      </svelte:element>
    {/each}
  </span>
{:else}
  <span
    class={[
      'can-match',
      altMatch === 'partial' && 'highlight alt-soft',
      altMatch === 'full' && 'highlight alt-full',
      className,
    ]}
    {...rest}
  >
    {text}
  </span>
{/if}

<style>
  .highlight {
    &.chunk {
      outline: var(--_text-search-highlight-outline);
      border-top: var(--_text-search-highlight-border-top);
      border-right: var(--_text-search-highlight-border-right);
      border-bottom: var(--_text-search-highlight-border-bottom);
      border-left: var(--_text-search-highlight-border-left);
      background-color: var(--_text-search-highlight-color);
      color: var(--_text-search-highlight-fg-color);
      text-decoration: var(--_text-search-highlight-decoration);
    }

    &.alt-soft {
      text-decoration-color: var(--_text-search-highlight-color);
    }

    &.alt-full {
      outline: var(--_text-search-highlight-outline);
      border-top: var(--_text-search-highlight-border-top);
      border-right: var(--_text-search-highlight-border-right);
      border-bottom: var(--_text-search-highlight-border-bottom);
      border-left: var(--_text-search-highlight-border-left);
      background-color: var(--_text-search-highlight-color);
      color: var(--_text-search-highlight-fg-color) !important;
      text-decoration: var(--_text-search-highlight-decoration);
    }
  }

  .can-match {
    transition-duration: var(--__transition-duration);
    transition-property: text-decoration-color, background-color, color;
    transition-timing-function: ease-in-out;
    border-radius: 2px;
    background-color: transparent;
    text-decoration: underline;
    text-decoration-style: solid;
    text-decoration-color: transparent;
  }
</style>
