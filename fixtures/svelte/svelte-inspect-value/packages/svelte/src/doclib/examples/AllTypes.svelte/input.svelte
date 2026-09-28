<script lang="ts">
  import { browser } from '$app/environment'
  import Inspect from '$lib/Inspect.svelte'
  import type { InspectProps } from '$lib/types.js'
  import { Observable, interval } from 'rxjs'
  import { readable, writable } from 'svelte/store'
  import sprite from './media/squirtle.png'
  import audio from './media/squirtle_cry.ogg'
  import { GLOBAL_OPTIONS_CONTEXT, type InspectOptions } from '$lib/options.svelte.js'
  import { getContext } from 'svelte'

  let { seeFlashing = $bindable(false), ...props }: InspectProps & { seeFlashing?: boolean } =
    $props()

  class Greeter {
    static staticProperty = 'hi'
    public nonStatic = 'yo'
    public name = 'World'

    constructor(name: string) {
      this.name = name
    }
  }

  function* fibonacci() {
    let current = 1
    let next = 1
    while (true) {
      yield current
      ;[current, next] = [next, current + next]
    }
  }

  const string1 = 'Que ma joie demeure'

  const segmenterFrGrapheme = new Intl.Segmenter('fr', {
    granularity: 'word',
  })
  const segments = $state(segmenterFrGrapheme.segment(string1)[Symbol.iterator]())

  class StringSubclass extends String {
    static staticprop = {
      test: 1,
    }

    anotherProp = { test: 1 }

    constructor(value?: string) {
      super(value)
    }
  }

  function customStore(initialValue = 0) {
    let interval: number | undefined
    let val = writable(initialValue, () => {
      if (browser) {
        interval = window.setInterval(() => {
          val.update((n) => n + 1)
        }, 500)
      }

      return () => {
        clearInterval(interval)
      }
    })

    return {
      ...val,
      set value(v: number) {
        val.set(v)
      },
    }
  }

  const o = new Observable((subscriber) => {
    subscriber.next(1)
    subscriber.next(2)
    subscriber.next(3)
    setTimeout(() => {
      subscriber.next(4)
      subscriber.complete()
    }, 1000)
  })

  const fakeStore = {
    subscribe: () => {},
  }

  const allTypes = $state({
    lotsOfChildren: [
      'a\nb',
      'a\nb',
      'a\nb',
      'a\nb',
      'a\nb',
      'a\nb',
      'a\nb',
      'a\nb',
      'a\nb',
      'a\nb',
      'a\nb',
      'a\nb',
      'a\nb',
      'a\nb',
      'a\nb',
      'a\nb',
      'a\nb',
      'a\nb',
      'a\nb',
      'a\nb',
      'a\nb',
      'a\nb',
      'a\nb',
      'a\nb',
      'a\nb',
      'a\nb',
      'a\nb',
      'a\nb',
      'a\nb',
      'a\nb',
      'a\nb',
      'a\nb',
      'a\nb',
      'a\nb',
      'f00\n\tbar',
      'f00\n\tbar',
      'f00\n\tbar',
      'f00\n\tbar',
      'f00\n\tbar',
      'f00\n\tbar',
      'f00\n\tbar',
      'f00\n\tbar',
      'f00\n\tbar',
      'f00\n\tbar',
      'f00\n\tbar',
      'f00\n\tbar',
      'f00\n\tbar',
      'f00\n\tbar',
      'f00\n\tbar',
      'f00\n\tbar',
      'f00\n\tbar',
      'f00\n\tbar',
      'f00\n\tbar',
    ],
    stores: {
      a: readable('test'),
      ab: writable('test'),
      b: writable({ testing: 'haha' }),
      b2: writable({ testing: 'haha' }),
      c: customStore(),
      o,
      interval: interval(1230),
      fakeStore,
    },
    strings: {
      basic: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
      multilineString: 'check\n\tthis\n\t\tout',
      urlString: 'https://zombo.com',
      mediaStrings: {
        image: sprite,
        audio,
      },
    },

    bigint: 9007199254740991n,
    bools: [true, false],
    symb: Symbol('abcd'),
    reg: /([\w.\-_]+)?\w+@[\w-_]+(\.\w+){1,}/gim,
    nil: [undefined, null, NaN, Infinity],
    array: [1, 2, 3],
    set: new Set([1, 2, 3]),
    map: new Map<unknown, unknown>([
      [0, 0],
      ['ya', 'yayaya'],
      [{ id: 123 }, 1],
      [[1, 2, 3], 2],
      [Symbol('key'), 'value'],
      [
        Promise.resolve('foo'),
        {
          get something() {
            return 'something'
          },
        },
      ],
      [null, 'null'],
      [undefined, 'undef'],
    ]),
    date: new Date('1970-01-02 03:45:57'),
    url: new URL('https://alicebob.website/?ref=abcdefg#about'),
    promise: Promise.resolve({
      name: 'a',
      b: { name: 'b', c: { name: 'c', d: { name: 'd' } } },
      g: [{ name: 'b', c: { name: 'c', d: { name: 'd' } } }],
      d: {},
    }),
    nesting: {
      nestedObjects: {
        b: { name: 'b', c: { name: 'c', d: { name: 'd' } } },
        g: [{ test: 1, a: 2, b: 2 }],
        name: 'a',
      },
      nestedPromises: {
        promises: {
          a: new Promise(() => {}),
          b: Promise.resolve('foo'),
        },
      },
      nestedArrays: [[[[[[[[[[[[[[[[['end']]]]]]]]]]]]]]]]],
    },
    functions: {
      double: (value: number) => 2 * value,
      normalFunction: function (some: string = 'some', thing: string) {
        return some + thing
      },
      asyncOneLiner: async (v: number) => new Promise((r) => setTimeout(() => r(v), v)),
      asyncfn: async function () {
        const boop = await Promise.resolve('boop')
        return boop
      },
      test: eval(`(function* generator() { yield 'a' })`),
      test2: eval(`(async function* generator() { yield 'a' })`),
      yieldTwo: function* () {
        yield 2
      },
      asynchronousGenerator: async function* () {
        yield 2
      },
      get asArray(): unknown[] {
        return Object.values({
          double: (value: number) => 2 * value,
          normalFunction: function (some: string = 'some', thing: string) {
            return some + thing
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          asyncOneLiner: async (v: any) => new Promise((r) => setTimeout(() => r(v), v)),
          asyncfn: async function () {
            const boop = await Promise.resolve('boop')
            return boop
          },
          test: eval(`(function* generator() { yield 'a' })`),
          test2: eval(`(async function* generator() { yield 'a' })`),
          yieldTwo: function* () {
            yield 2
          },
          asynchronousGenerator: async function* () {
            yield 2
          },
        })
      },
    },
    gettersAndSetters: {
      get anObject() {
        return {
          a: { b: { c: { d: { e: 'end' } } } },
        }
      },
      count: 1,
      get current() {
        this.getterAccessedTimes++
        return this.count
      },
      set current(value: number) {
        this.count = value
      },
      get throws() {
        // eslint-disable-next-line no-console
        console.trace('throwing getter accessed')
        throw 'yeet'
      },
      set throws(value: unknown) {
        throw 'throwing'
      },
      getterAccessedTimes: 0,
      get getterWithSideEffect() {
        this.test += '@'
        return 'something'
      },
      get throwSomething() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let goof: any
        goof.doesNotExist.doesNotExist()
        // throw new Error('yayaya')
        return 'blah'
      },
      set throwSomething(value: string) {
        JSON.parse('t')
      },
      get self() {
        return this
      },
      test: '@',
    },
    typedArrays: {
      eight: new Int8Array([1, 2, 3]),
      Uint8Array: new Uint8Array([1, 2, 3]),
      Uint8ClampedArray: new Uint8ClampedArray([1, 2, 3]),
      sixteen: new Int16Array([1, 2, 3, 4, 5]),
      Uint16Array: new Uint16Array([1, 2, 3]),
      thirtytwo: new Int32Array([1, 2, 3, 4, 5]),
      Uint32Array: new Uint32Array([1, 2, 3]),
      Float32Array: new Float32Array([1.2, 3.4, 5.6]),
      Float64Array: new Float64Array([1.2345, 3.4, 5.6]),
      BigInt64Array: new BigInt64Array([1n, 2n, 3n]),
      BigUint64Array: new BigUint64Array([1n]),
    },
    classes: {
      classCtr: Greeter,
      classInstance: new Greeter('You'),
      classNoEntries: class Foo {},
    },
    errors: {
      error: new Error('oh no!'),
      typeerror: new TypeError('snapple'),
    },
    body: null,
    iterators: {
      array: [1, 2, 3, 4].values(),
      set: new Set([12, 34, 45]).values(),
      map: new Map<unknown, unknown>([
        [0, 0],
        [{ id: 123 }, 1],
        [[1, 2, 3], 2],
        [Symbol('key'), 'value'],
        [
          Promise.resolve('foo'),
          {
            get something() {
              return 'something'
            },
          },
        ],
      ]).entries(),
      fib: fibonacci(),
      stringIterator: 'abdcdefghijklmnopqrstuvwxyzæøå'[Symbol.iterator](),
      // elements: browser ? document.body.childNodes.values() : null,
      segments,
      string: {
        value: 'test1test2',
        regExp: /t(e)(st(?<digit>\d?))/g,
        get matchAll() {
          return this.value.matchAll(this.regExp)
        },
        get exec() {
          return this.regExp.exec(this.value)
        },
        get match() {
          return this.value.match(this.regExp)
        },
      },
    },
    number: 0,
    weirdKeys: {
      42: 'numbers are cool',
      punctuation: {
        '=': 'eq',
        '@': 'at',
        '-': '',
        ':': '',
        ';': '',
        '.': '',
        ',': '',
        '!': 1,
        '?': '',
        '¡': '¿',
        '¿': '!',
        '#': '',
        '~': 'tilde',
        '*': 'asterisk',
      },
      braces: {
        '{': '',
        '}': '',
        '[': '',
        ']': '',
        '<': '',
        '>': '',
      },
      quotes: {
        '"': 'double quote',
        "'": 'single quote',
        '`': 'backtick',
      },
      slashesandEscaped: {
        '\\': 'backslash',
        '//': { hmm: 'test' },
        '\n': 'newline',
        '\t': 'tab',
        '\r': 'carriage return',
      },
      accented: {
        a: {
          å: '',
          à: '',
          ä: '',
          á: '',
          â: '',
          ã: '',
          ā: '',
          ạ: '',
        },
        e: {
          é: 'é',
          è: 'é',
          ê: 'ê',
          ë: '',
          ė: '',
        },
      },
      à: '',
      æ: '',
      whiteSpace: {
        '': 'empty string key',
        ' ': 'space string key',
        '  ': 'double space string key',
        '      starts   ': ' a    ',
        'spaces in between': ' a    ',
      },
      _: 'underscores are legit',
      $: 'dollar signs should be legit',
      'asdf\\': 'oo',
      [Symbol('')]: 'agaga',
    },
    arbitraryObjects: {
      notice:
        'objects without a defined specialized view component.\nproperties are enumerated and nested.',
      // navigator: browser ? navigator : null,
      registry: new FinalizationRegistry(() => {}),
    },
    empties: {
      object: {},
      array: [],
      set: new Set(),
      map: new Map(),
      string: '',
    },
    primitiveCtr: {
      str: new String('yup'),
      num: new Number(),
      num2: new Number(1),
      bool: new Boolean(),
      strsubclass: new StringSubclass('test'),
      subclass: StringSubclass,
    },
  })

  $effect(() => {
    const interval = window.setInterval(() => {
      if (seeFlashing) allTypes.number++
    }, 2000)

    return () => window.clearInterval(interval)
  })

  const globalOptions = getContext<Partial<InspectOptions> | (() => Partial<InspectOptions>)>(
    GLOBAL_OPTIONS_CONTEXT
  )

  const allTypesSearch = $derived.by(() => {
    const globalOpts = typeof globalOptions === 'function' ? globalOptions() : globalOptions
    if (globalOpts?.search === false) {
      return 'highlight'
    }
    return globalOpts?.search ?? undefined
  })
</script>

{#snippet heading(collapsed: boolean)}
  DEMO
  {#if !collapsed}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <label
      onclick={(e) => {
        e.stopPropagation()
      }}
    >
      increment number
      <input type="checkbox" bind:checked={seeFlashing} />
    </label>
  {/if}
{/snippet}

<Inspect
  {heading}
  name="allTypes"
  values={allTypes}
  search={allTypesSearch}
  {...props}
  expandLevel={0}
></Inspect>

<style>
  label {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 1ch;
    margin: 0 !important;
    width: 100%;
    font-size: 0.8em;
  }
</style>
