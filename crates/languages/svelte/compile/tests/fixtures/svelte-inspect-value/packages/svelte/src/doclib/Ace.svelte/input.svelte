<script lang="ts">
  import { browser } from '$app/environment'
  import type AceAjax from 'brace'
  import { untrack } from 'svelte'
  import type { AceProps } from './aceprops.js'

  let { value, onchange, valid, message }: AceProps = $props()

  let editor = $state<AceAjax.Editor>()
  let div = $state<HTMLDivElement | undefined>()

  export function setValue(value: string) {
    editor?.setValue(value)
  }

  async function initEditor(ele: HTMLDivElement) {
    const { default: ace } = await import('brace')
    editor = ace.edit(ele) as unknown as AceAjax.Editor
    if (editor) {
      editor.$blockScrolling = Infinity
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any)['ace'] = ace
    //@ts-expect-error nonono
    await import('brace/mode/javascript')
    await import('./brace-theme.js')

    if (editor) {
      editor.$blockScrolling = Infinity
      editor.setTheme('ace/theme/inspect')
      editor.getSession().setMode('ace/mode/javascript')
      editor.setOptions({
        maxLines: 100,
        minLines: 12,
        showLineNumbers: false,
        showFoldWidgets: false,
        showPrintMargin: false,
        showGutter: false,
        highlightActiveLine: false,
      })
      // editor!.setValue('const hello = "hello world!"')
      editor.session.on('change', () => {
        const val = editor?.getValue()
        if (val && onchange) {
          onchange(val)
        }
      })
    }
  }

  $effect(() => {
    if (editor && value) {
      editor.setValue(value, -1)

      editor.resize(true)
    }
  })

  $effect(() => {
    if (div && browser) {
      untrack(() => {
        if (div) initEditor(div)
      })
    }
    return () => {
      editor?.destroy()
    }
  })
</script>

<div class="wrapper" class:valid>
  <div class="ace" bind:this={div}></div>
  <span
    >{#if message}{message}{/if}</span
  >
</div>

<style>
  .wrapper {
    position: relative;
    border: 1px solid var(--docs-border-color);
    border-radius: 8px;
    background-color: #1e2c3e;
    padding: 0.5em;
    width: 100%;
    overflow: hidden;
  }

  .wrapper:focus-within {
    border-color: var(--red);

    &.valid {
      border-color: var(--green);
    }
  }

  .ace {
    width: 100%;
    height: auto;
  }

  span {
    position: absolute;
    top: 0;
    right: 0;
    font-size: 10px;
    font-family: monospace;
  }
</style>
