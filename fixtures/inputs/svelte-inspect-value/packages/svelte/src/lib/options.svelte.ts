import { getContext, setContext, type Snippet } from 'svelte'
import type { CollapseState } from './state.svelte.js'
import type { CustomComponents } from './types.js'
import * as util from './util.js'
import { quartOut } from 'svelte/easing'

export const OPTIONS_CONTEXT: symbol = Symbol('inspect-options')
/**
 * @internal
 * @private
 *
 * Exported for tests. Use `setGlobalOptions` or `InspectOptionsProvider` instead
 */
export const GLOBAL_OPTIONS_CONTEXT: symbol = Symbol('inspect-global-options')

/**
 * Hotkeys configuration using {@link https://github.com/jamiebuilds/tinykeys | tinykeys} syntax.
 *
 * Note: The string `'$mod'` means "command" on macOS and "ctrl" on Windows / Linux
 *
 * @example
 * ```svelte
 * <Inspect hotkeys={{
 *  expandTop: 'Shift+$mod+ArrowUp', // override
 *  collapseTop: false // disable
 *  // search: '' // keeps default if omitted
 * }} />
 * ```
 *
 * @see {@link InspectOptions.hotkeys}
 */
export type InspectHotkeys = {
  /**
   * Hotkey for focusing search field if {@linkcode InspectOptions.search | search} is enabled
   *
   * @default 'Shift+$mod+F'
   */
  search: string | false
  /**
   * Hotkey for expanding all top level nodes
   *
   * @default '$mod+ArrowRight'
   */
  expandTop: string | false
  /**
   * Hotkey for collapsing all top level nodes
   *
   * @default '$mod+ArrowLeft'
   */
  collapseTop: string | false
}

const DEFAULT_HOTKEYS: InspectHotkeys = {
  search: 'Shift+$mod+F',
  expandTop: '$mod+ArrowRight',
  collapseTop: '$mod+ArrowLeft',
}

/**
 *
 * Various options to configure the look and feel of components exported by `'svelte-inspect-value'`
 *
 * These can be set directly on `Inspect` and `Inspect.Panel` as props, or "globally" using
 * {@link setGlobalInspectOptions} or `InspectOptionsProvider`
 * Props will override any options using the provider methods.
 *
 * @example
 * ```svelte
 * <script>
 *  import Inspect, {InspectOptionsProvider} from 'svelte-inspect-value'
 *  import data from './data.js'
 * </script>
 *
 * <InspectOptionsProvider options={{ expandLevel: 3, theme: 'light' }}>
 *   <Inspect value={data} expandLevel={20} /> <!-- override expandLevel -->
 * </InspectOptionsProvider>
 * ```
 */
export type InspectOptions = {
  /**
   * Display length of arrays or strings and number of nested entries in objects / maps etc
   *
   * @default true
   */
  showLength: boolean
  /**
   * Display type labels before values e.g. "string" / "number"
   * Does not affect class / function / promise
   *
   * @default true
   */
  showTypes: boolean
  /**
   * Display preview of nested values
   *
   * @default true
   */
  showPreview: boolean
  /**
   * How many entries / items of arrays, objects, maps, sets etc. to preview
   *
   * @default 3
   */
  previewEntries: number
  /**
   * How many levels of nested values to preview before "collapsing" nested values to their type only
   *
   * @default 1
   */
  previewDepth: number
  /**
   * Indicate when a value or child value is updated
   *
   * @default true
   */
  flashOnUpdate: boolean
  /**
   * Enable or disable "tool-buttons" that appear on hovering a value.
   *
   * @default true
   */
  showTools: boolean
  /**
   * Set a max display length for string values. `0` means display full string
   *
   * @default 0
   */
  stringCollapse: number
  /**
   * Custom components for displaying types.
   * An object with type as keyname and array of component and optional
   * prop modification function and predicate determining if custom component should be used.
   *
   * Use the helper function {@linkcode util.addComponent | addComponent} to get properly typed props for the custom component.
   *
   * @example
   * ```svelte
   * <script lang="ts">
   *  import Inspect, {addComponent} from 'svelte-inspect-value'
   *  import HexColorDisplay from './HexColorDisplay.svelte'
   *  import CustomBigIntDisplay from './CustomBigIntDisplay.svelte'
   * </script>
   *
   * <Inspect customComponents={{
   *    bigint: [CustomBigIntDisplay],
   *    string: addComponent(
   *      HexColorDisplay,
   *      // transform props or pass extra props
   *      (props) => props,
   *      // revert to default string component if false
   *      (props) => props.value.startsWith('#'))
   * }} />
   * ```
   *
   * @default {}
   */
  customComponents: CustomComponents
  /**
   * Disable all animations (both css and Svelte transitions)
   *
   * @default false
   */
  noanimate: boolean
  /**
   * Set transition / animation rates
   *
   * `0.5` will double transition durations while `2` will halve durations.
   *
   * The base duration for transitions is 250ms.
   *
   * @default 1
   */
  animRate: number
  /**
   * Easing-function for expand/collapse transitions
   *
   * @default (t) => Math.pow(t - 1.0, 3.0) * (1.0 - t) + 1.0; // quartOut
   */
  easing: (t: number) => number
  /**
   * Render no borders or background
   *
   * @default false
   */
  borderless: boolean
  /**
   * Display string values with double or single quotes
   *
   * @default 'single'
   */
  quotes: 'single' | 'double' | 'none'
  /**
   * Set color theme class
   *
   * Available themes: `'inspect'|'drak'|'stereo'|'dark'|'light'|'plain'
   *
   * @default 'inspect'
   */
  theme: ('inspect' | 'drak' | 'stereo' | 'dark' | 'light' | 'plain') | (string & {})
  /**
   * Expand all expandable nodes by default
   *
   * @default false
   */
  expandAll: boolean
  /**
   * Default expanded level
   *
   * @default 1
   */
  expandLevel: number
  /**
   * Initially expanded paths
   *
   * @default []
   * @example
   * ```svelte
   * <script>
   *  import Inspect from 'svelte-inspect-value'
   *
   *  const value = {
   *   a: { b: [{ c: '' }], d: 0 }
   *  }
   * </script>
   *
   * <!-- default name of root expandable is "root" -->
   * <Inspect {value} expandPaths={['root.a.b.0']} />
   * <!-- if name is set -->
   * <Inspect {value} name="obj" expandPaths={['obj.a.b.0']} />
   * ```
   */
  expandPaths: string[]
  /**
   * Embed images or sounds if a string is a url or path ending with a valid image or sound file extension
   *
   * @default false
   */
  embedMedia: boolean
  /**
   * Determines what properties are shown when inspecting HTML elements
   *
   * - `'simple'` - minimal list of properties including classList, styles, dataset and current scrollPositions
   * - `'full'` - lists all enumerable properties of an element
   *
   * @default 'simple'
   */
  elementView: 'simple' | 'full'
  /**
   * Render condition for `Inspect`
   *
   * Function or value. `Inspect` will render if value or return-value is truthy.
   *
   * Most valuable if set with global options and there are multiple `Inspect` instances,
   * otherwise using Svelte `{#if}{/if}` blocks is recommended.
   *
   * @default true
   */
  renderIf: unknown
  /**
   * Try parsing strings that start with `'['` or `'{'` and display the parsed value
   *
   * @default false
   */
  parseJson: boolean
  /**
   * Custom callback run when clicking copy tool-button.
   * If this option is set without passing a function to `canCopy`, the
   * copy button will be shown for all values.
   *
   * This overrides the default copy-button behavior.
   *
   * @see {@link InspectOptions.canCopy}
   * @returns {boolean | Promise<boolean>} `boolean` or `Promise` resolving to boolean indicating copying value was successful if true. The copy button will change color on success.
   * @default undefined
   */
  onCopy:
    | ((
        value: unknown,
        type: string,
        path: unknown[]
      ) => Promise<boolean | void> | (boolean | void))
    | undefined
  /**
   * Custom predicate that determines if copy-button should be displayed for a value
   *
   * @default undefined
   */
  canCopy: ((value: unknown, type: string, path: unknown[]) => boolean) | undefined
  /**
   * Custom callback run when clicking log tool-button.
   *
   * This overrides the default log-button behavior.
   *
   * @default undefined
   */
  onLog: ((value: unknown, type: string, path: unknown[]) => void) | undefined
  /**
   * Called whenever a node is collapsed or expanded.
   *
   * @default undefined
   */
  onCollapseChange: ((state: CollapseState) => void) | undefined
  /**
   * Enable or disable svelte-store inspection.
   * Objects with a `subscribe` method will be inspected as stores and show their subscription value.
   *
   * Set to `true`, `'value-only'` or `'full'` to enable.
   *
   * - `'full' | true` - render store value as nested value along with other properties on the store object
   * - `'value-only'` - render store value only along with a note indicating the value was retrieved from a store
   *
   * @default 'full'
   */
  stores: boolean | 'value-only' | 'full'
  /**
   * Enable or disable search functionality.
   *
   * Three modes are available:
   *
   * - `'filter' | true` - children and siblings of matching nodes will be visible
   * - `'filter-strict'` - only matches will be visible
   * - `'highlight'` - no nodes will be hidden, but matches will be highlighted
   *
   * @default false
   */
  search: boolean | 'highlight' | 'filter' | 'filter-strict'
  /**
   * Initial multi-term search mode
   *
   * - `'and'` - nodes must match every term
   * - `'or'` - nodes can match one of the terms
   *
   * @default 'or'
   */
  searchMode: 'and' | 'or'
  /**
   * When `search` is enabled, highlight matches in keys,
   * types and values when typing in the search input box.
   *
   * @see {@link InspectOptions.search}
   * @default true
   */
  highlightMatches: boolean
  /**
   * A `string` or `Snippet` that will be rendered as a small heading with a collapse-button for the component.
   *
   * The snippet parameter indicates if the instance has been collapsed
   */
  heading: boolean | string | Snippet<[boolean]>
  /**
   * Configures hotkeys using {@link https://github.com/jamiebuilds/tinykeys | tinykeys} syntax.
   *
   * Use an object to override defaults, `true` to use defaults and `false` to disable hotkeys
   *
   * @see {@link InspectHotkeys}
   * @default { search: 'Shift+$mod+F', expandTop: '$mod+ArrowRight', collapseTop: '$mod+ArrowLeft' }
   * @since 0.11.0
   */
  hotkeys: Partial<InspectHotkeys> | boolean
  /**
   * Disables using arrow keys, home, end, enter and space to navigate or expand/collapse nodes when
   * a node is focused.
   *
   * @default false
   * @since 0.11.0
   */
  disableKeynav: boolean
  /**
   * Enables typing to focus any node with matching text when any node is focused.
   *
   * @default true
   * @since 0.11.0
   */
  typeToFocus: boolean
}

/**
 * @useDeclaredType
 * @inline
 */
export type InspectOptionsProps = Partial<InspectOptions>

export const DEFAULT_OPTIONS: InspectOptions = {
  noanimate: false,
  animRate: 1,
  easing: quartOut,
  quotes: 'single',
  showTypes: true,
  showPreview: true,
  previewDepth: 1,
  previewEntries: 3,
  flashOnUpdate: true,
  showLength: true,
  showTools: true,
  stringCollapse: 0,
  theme: 'inspect',
  borderless: false,
  customComponents: {},
  expandAll: false,
  expandLevel: 1,
  expandPaths: [],
  embedMedia: false,
  elementView: 'simple',
  renderIf: true,
  parseJson: false,
  onCopy: undefined,
  canCopy: undefined,
  onLog: undefined,
  onCollapseChange: undefined,
  stores: 'full',
  search: false,
  searchMode: 'or',
  highlightMatches: true,
  heading: false,
  hotkeys: true,
  disableKeynav: false,
  typeToFocus: true,
} as const

export const OPTIONS_KEYS = Object.keys(DEFAULT_OPTIONS) as (keyof InspectOptions)[]

export function mergeOptions(
  fromProps: Partial<InspectOptions>,
  fromContext: Partial<InspectOptions> = {}
): InspectOptions {
  const definedPropOptions = Object.entries(fromProps).filter(([, v]) => v != null)
  return {
    ...DEFAULT_OPTIONS,
    ...fromContext,
    ...Object.fromEntries(definedPropOptions),
  }
}

export function createOptions(options: () => InspectOptions) {
  const animationRate = $derived(util.clamp(options().animRate, 0.001, 10))
  const transitionDuration = $derived(
    options().noanimate ? 0 : util.clamp(250 / animationRate, 0, 30_000)
  )
  const flashDuration = $derived(
    options().flashOnUpdate ? util.clamp(300 / animationRate, 100, 1000) : 0
  )
  // this could be Infinity but let's set a cap just to be sure
  const expandLevel = $derived(
    util.clamp(options().expandAll ? 30 : (options().expandLevel ?? 1), 0, 30)
  )

  const hotkeys = $derived.by(() => {
    const hotkeysOpts = options().hotkeys
    if (typeof hotkeysOpts === 'object') return { ...DEFAULT_HOTKEYS, ...hotkeysOpts }
    if (hotkeysOpts === true) return DEFAULT_HOTKEYS
    return hotkeysOpts
  })

  return {
    get value() {
      return options()
    },
    get transitionDuration() {
      return transitionDuration
    },
    get flashDuration() {
      return flashDuration
    },
    get expandLevel() {
      return expandLevel
    },
    get hotkeys() {
      return hotkeys
    },
  }
}

export type OptionsContext = ReturnType<typeof createOptions>

/**
 * Set a context with configuration options for `Inspect`
 *
 * Alternative to using the `InspectOptionsProvider`-component.
 */
export function setGlobalInspectOptions(
  options: () => Partial<InspectOptions>
): Partial<InspectOptions>
/**
 * Set a context with configuration options for `Inspect`
 * @deprecated pass a function that returns the options instead of an object
 */
export function setGlobalInspectOptions(options: Partial<InspectOptions>): Partial<InspectOptions>
export function setGlobalInspectOptions(
  options: Partial<InspectOptions> | (() => Partial<InspectOptions>)
) {
  if (typeof options !== 'function') {
    console.warn(`[SVELTE-INSPECT-VALUE]:
Passing global options as an object is deprecated and will be removed in a future version.
Reactivity is not guaranteed.
Set global options like this instead: setGlobalInspectOptions(() => {options value})`)
  }

  return setContext(GLOBAL_OPTIONS_CONTEXT, options)
}

/**
 * Get global options context
 */
export function getGlobalInspectOptions() {
  return getContext<Partial<InspectOptions> | (() => Partial<InspectOptions>) | undefined>(
    GLOBAL_OPTIONS_CONTEXT
  )
}

export function useOptions(): OptionsContext {
  return getContext<OptionsContext>(OPTIONS_CONTEXT)
}
