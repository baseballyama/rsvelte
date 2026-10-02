<script module lang="ts">
  import core from 'highlight.js/lib/core'
  import xml from 'highlight.js/lib/languages/xml'

  const hljs = core.newInstance()
  hljs.configure({ classPrefix: '' })
  hljs.registerLanguage('xml', xml)
</script>

<script lang="ts">
  import { BROWSER } from 'esm-env'
  import { onMount } from 'svelte'
  import { useOptions } from '../options.svelte.js'
  import type { TypeViewProps } from '../types.js'
  import { collapseString } from '../util.js'

  type Props = TypeViewProps<HTMLElement>

  let { value }: Props = $props()

  let options = useOptions()

  const getOpenTag = (ele: HTMLElement, stringCollapse: number) => {
    if (ele) {
      let tag = ele.innerHTML
        ? ele.outerHTML.slice(0, ele.outerHTML.indexOf(ele.innerHTML))
        : ele.outerHTML
      return collapseString(tag, stringCollapse)
    }
    return ''
  }

  const highlight = (markup: string) => hljs.highlight(markup, { language: 'xml' }).value

  let highlighted: string = $state('')

  const mutationObserver = new MutationObserver(([mutation]) => {
    const outer = getOpenTag(mutation.target as HTMLElement, options.value.stringCollapse)
    highlighted = highlight(outer)
  })

  onMount(() => {
    if (value) {
      const outer = getOpenTag(value, options.value.stringCollapse)
      highlighted = highlight(outer)
      mutationObserver.observe(value, { attributes: true })
    }

    return () => {
      mutationObserver.disconnect()
    }
  })
</script>

{#if BROWSER}
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  <code data-testid="value" class="value html hl" title="">{@html highlighted}</code>
{/if}

<style>
  :global code.value.html.hl {
    border-radius: 4px;
    background-color: transparent;
    padding-inline: 0.5em;

    .tag {
      color: var(--_text-color);
    }

    .name {
      color: var(--_error-color);
    }

    .attr {
      color: var(--_function-name-color);
    }

    .string {
      color: var(--_string-value-color);
    }
  }
</style>
