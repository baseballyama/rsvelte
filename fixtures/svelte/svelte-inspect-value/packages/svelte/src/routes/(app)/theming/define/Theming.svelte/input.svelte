<script lang="ts">
  import { intervalEffect } from '$doclib/interval-effect.svelte.js'
  import Inspect from '$lib/Inspect.svelte'
  import type { InspectProps } from '$lib/types.js'
  import { addComponent } from '$lib/util.js'
  import { onMount } from 'svelte'
  import type { SvelteHTMLElements } from 'svelte/elements'
  import HexString from '../../reference/custom/HexString.svelte'
  import type { ThemeKeys } from './themes.js'

  const props: InspectProps & SvelteHTMLElements['div'] & { colors: Record<ThemeKeys, string> } =
    $props()

  class ClassName {}

  const base08Preview = $state({
    numberType: 123,
    booleanType: true,
    error: new Error('i am an error'),
    nodeNote: '["i was parsed!"]',
    tagNames: null as unknown,
    get keyPrefixes() {
      return class RandomClass {
        static asdf = ''
      }
    },
  })

  const base06Preview = $state({ flashOnUpdateColor: 0 })
  intervalEffect(() => {
    base06Preview.flashOnUpdateColor++
  }, 1000)
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
      return props.colors['--base0E']
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
    base00: [props.colors['--base00'], 'background-color'],
    base01: [props.colors['--base01'], 'row-hover-color', 'nil-type-bg', null, undefined],
    base02: [props.colors['--base02'], 'text-selection-background'],
    base03: [props.colors['--base03'], 'border-color', ['expand-button'], 'length color'],
    // base04: [props.colors['--base04']],
    base05: [props.colors['--base05'], 'foreground / text-color'],
    // base06: [props.colors['--base06']],
    base06: [props.colors['--base06'], 'flash on update color', base06Preview.flashOnUpdateColor],
    // base07: [props.colors['--base07'], 'flash on update color', base07Preview.flashOnUpdateColor],
    base08: [props.colors['--base08'], base08Preview],
    base09: [props.colors['--base09'], base09Preview],
    base0A: [props.colors['--base0A'], 'base0A is the string color', { ['string keys']: '' }],
    base0B: [props.colors['--base0B'], ...base0BPreview],
    base0C: [props.colors['--base0C'], base0CPreview],
    base0D: [props.colors['--base0D'], base0DPreview],
    base0E: [props.colors['--base0E'], base0EPreview],
    // base0F: [props.colors['--base0F']],
    previewBrackets,
    functionBodyPreview,
  })

  $effect.pre(() => {
    document.body.dataset['attributecolor'] = props.colors['--base0B']
  })
</script>

<Inspect
  customComponents={{
    string: addComponent(
      HexString,
      () => ({
        showString: true,
      }),
      (props) => props.value.startsWith('#')
    ),
  }}
  values={theming}
  name="legend"
  showLength={true}
  showTypes
  expandLevel={0}
  heading="theme preview"
  expandPaths={['base08.1', 'base09', 'base0C.1', 'base0D.1', 'base0E.1']}
  previewDepth={Infinity}
  previewEntries={10}
  {...props}
  parseJson
/>
