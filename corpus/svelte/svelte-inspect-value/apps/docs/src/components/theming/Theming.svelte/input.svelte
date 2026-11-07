<script lang="ts">
  import Inspect, { type InspectProps } from 'svelte-inspect-value'

  import { addComponent } from 'svelte-inspect-value'
  import { onMount } from 'svelte'
  import type { SvelteHTMLElements } from 'svelte/elements'
  import HexString from './HexString.svelte'
  import type { ThemeKeys } from './themes.js'

  type Props = InspectProps &
    SvelteHTMLElements['div'] & { colors: Record<ThemeKeys, string>; panel: boolean; style: string }

  let { panel, style, colors, borderless, ...props }: Props = $props()

  class ClassName {}

  const base08Preview = $state({
    numberType: 123,
    booleanType: true,
    error: new Error('i am an error'),
    tagNames: null as unknown,
    get keyPrefixes() {
      return class RandomClass {
        static asdf = ''
      }
    },
  })

  const base06Preview = $state({ flashOnUpdateColor: 0 })
  $effect(() => {
    let int = window.setInterval(() => {
      base06Preview.flashOnUpdateColor++
    }, 1000)
    return () => {
      window.clearInterval(int)
    }
  })
  const base09Preview = Symbol('symbol type indicator')
  const base0BPreview = $state<unknown[]>([function funcNames() {}])
  onMount(() => {
    const image = new Image()
    image.src = '/favicon.png'
    base08Preview.tagNames = image
    // base08Preview.
    base0BPreview.push(document.body)
  })
  const base0CPreview = {
    objType: {},
    arrType: [],
    nodeNote: '["i was parsed!"]',
    date: new Date(),
    map: new Map([['#000', '#000']]),
    set: new Set(['#000', '#888', '#fff']),
    urls: new URL('https://example.com?q=test'),
    symbol: Symbol('symbol value color'),
    classInstances: new ClassName(),
  }
  const base0DPreview = {
    classNames: ClassName,
  }
  const base0EPreview = {
    stringType: '<--',
    numberValue: 1234,
    boolValue: true,
    get buttonColor() {
      return colors['--base0E']
    },
  }
  const previewBrackets = [[[[[[[[[[[[[[[[[[['end']]]]]]]]]]]]]]]]]]]

  const functionBodyPreview = eval(`
(function base0B(base09, ...params) {
    // comments: base03
    class Base0D {
      static base08;
    }
    console.log(base05, ...params)
    while (true) {
      break;
    }
    this.base0B = params;
    const demo = {
      [Symbol('demo')]: Symbol.for('demo'),
      base0B: new Base0D(),
      number: 123456780,
      bigint: 1n,
      func: () => {}
    }
  
    return 'base0A' + demo.func + demo.func()
 })`)

  const theming = $derived({
    base00: [colors['--base00'], 'background-color'],
    base01: [colors['--base01'], 'row-hover-color', 'nil-type-bg', null, undefined],
    base02: [colors['--base02'], 'text-selection-background'],
    base03: [colors['--base03'], 'border-color', ['expand-button'], 'length color'],
    // base04: [props.colors['--base04']],
    base05: [colors['--base05'], 'foreground / text-color'],
    // base06: [props.colors['--base06']],
    base06: [colors['--base06'], 'flash on update color', base06Preview.flashOnUpdateColor],
    // base07: [props.colors['--base07'], 'flash on update color', base07Preview.flashOnUpdateColor],
    base08: [colors['--base08'], base08Preview],
    base09: [colors['--base09'], base09Preview],
    base0A: [colors['--base0A'], 'base0A is the string color', { ['string keys']: '' }],
    base0B: [colors['--base0B'], ...base0BPreview],
    base0C: [colors['--base0C'], base0CPreview],
    base0D: [colors['--base0D'], base0DPreview],
    base0E: [colors['--base0E'], base0EPreview],
    // base0F: [props.colors['--base0F']],
    previewBrackets,
    functionBodyPreview,
  })

  $effect.pre(() => {
    document.body.dataset['attributecolor'] = colors['--base0B']
  })

  let customComponents = {
    string: addComponent(
      HexString,
      () => ({
        showString: true,
      }),
      (props) => props.value.startsWith('#')
    ),
  }

  let expandPaths = ['base08.1', 'base09', 'base0C.1', 'base0D.1', 'base0E.1']
</script>

<div class="preview not-content">
  <div style:display={panel ? 'contents' : 'none'}>
    <Inspect.Panel
      theme=""
      persist={{ storage: 'session', key: 'siv.theming-panel' }}
      align="full bottom"
      {customComponents}
      values={theming}
      showLength={true}
      showTypes
      expandLevel={0}
      heading="theme preview"
      {expandPaths}
      previewDepth={Infinity}
      previewEntries={10}
      style={style + 'position: absolute;'}
      open
      parseJson
      {borderless}
      wiggleOnUpdate={false}
    />
  </div>

  <div style:display={panel ? 'none' : 'contents'}>
    <Inspect
      {...props}
      {customComponents}
      values={theming}
      showLength={true}
      showTypes
      expandLevel={0}
      heading="theme preview"
      {expandPaths}
      previewDepth={Infinity}
      previewEntries={10}
      {style}
      parseJson
      {borderless}
    />
  </div>
</div>

<style>
  .preview {
    display: flex;
    position: relative;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    transition: background-color 300ms;
    border: 1px solid var(--sl-color-gray-3);
    border-radius: 8px;
    background-color: var(--preview-bg);
    padding: 0.5em;
    width: 100%;
    height: 850px;
    overflow: hidden;
  }
</style>
