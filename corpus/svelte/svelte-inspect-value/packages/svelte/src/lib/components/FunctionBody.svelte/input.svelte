<script module lang="ts">
  import core from 'highlight.js/lib/core'
  import javascript from 'highlight.js/lib/languages/javascript'
  import memoize from 'memoize'

  const hljs = core.newInstance()
  hljs.configure({ classPrefix: '' })
  hljs.registerLanguage('javascript', javascript)

  function highlightMarkup(markup: string) {
    return hljs.highlight(markup, { language: 'javascript' })
  }

  const highlight_markup = memoize(highlightMarkup)
</script>

<script lang="ts">
  import { useOptions } from '../options.svelte.js'
  import type { TypeViewProps } from '../types.js'
  import { collapseString } from '../util.js'

  type Props = TypeViewProps<string> & { inline?: boolean }

  let { value, inline = false }: Props = $props()

  let options = useOptions()

  const hljsHighlight = (markup: string, stringCollapse: number) => {
    return highlight_markup(collapseString(markup, stringCollapse)).value
  }

  let highlighted: string = $derived(
    hljsHighlight(value.replaceAll('\t', ' '), options.value.stringCollapse)
  )
</script>

<!-- eslint-disable svelte/no-at-html-tags -->
<code data-testid="value" title={value} class:inline class="value function hl">
  {@html highlighted}
</code>

<style>
  code.value.function.hl.inline {
    display: inline;
    padding: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :global code.value.function.hl {
    background-color: unset;
    padding-left: var(--_indent);
    color: var(--_text-color) !important;
    white-space: pre;

    .title.function_ {
      color: var(--_function-name-color);
    }

    .title.class_ {
      color: var(--_class-name-color);
    }

    .variable.language_ {
      color: var(--function-var-color, var(--base0E, purple));
    }

    .tag {
      color: var(--_text-color);
    }

    .keyword {
      color: var(--_error-color);
    }

    .name {
      color: var(--_error-color);
    }

    .attr {
      color: var(--function-attribute-color, var(--base0B, green));
    }

    .number {
      color: var(--_number-value-color);
    }

    .literal {
      color: var(--_boolean-value-color);
    }

    .comment {
      /** backwards compatibility to before prefixing with --function- */
      color: var(--function-comment-color, var(--comment-color, var(--base03)));
    }

    .string {
      color: var(--_string-value-color);
    }

    .params {
      color: var(--function-params-color, var(--base09, orange));
    }

    .property {
      color: var(--function-property-color, var(--base0B, lightgreen));
    }
  }
</style>
