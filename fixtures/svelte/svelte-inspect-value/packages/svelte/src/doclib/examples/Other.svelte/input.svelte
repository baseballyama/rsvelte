<script lang="ts">
  import Inspect from '$lib/index.js'
  import { getContext, onMount } from 'svelte'
  import { SvelteDate, SvelteMap } from 'svelte/reactivity'
  import { intervalEffect } from '../interval-effect.svelte.js'

  let error = $state()

  let date = new SvelteDate('1988-12-15 04:16')
  let number = $state(0)
  let currentString = $state(0)

  let frames = [
    '-         ',
    ' =        ',
    '  -       ',
    '   =      ',
    '    -     ',
    '     =    ',
    '      -   ',
    '       =  ',
    '        - ',
    '         =',
  ]
  let dash = $derived(frames[currentString])

  onMount(() => {
    try {
      let lol: unknown
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, @typescript-eslint/no-explicit-any
      ;(lol as any).doesNotHaveProperty
    } catch (e) {
      error = e as Error
    }
  })

  intervalEffect(() => {
    date = new SvelteDate()
  }, 1000)

  intervalEffect(() => {
    number = Math.ceil(Math.random() * 1000000000000)
  }, 100)

  intervalEffect(() => {
    currentString++
    if (currentString === 10) currentString = 0
  }, 500)

  let value = $derived({
    error,
    date,
    reg: /^[re(g)ex]$/,
    dash,
    number,
  })

  getContext<SvelteMap<string, string>>('toc')?.set('Other', 'other')
</script>

<div class="flex col">
  <h3>Other</h3>
  <p>
    Other types handled includes Error, Date, regexp, and just about any object with enumerable
    properties.<br />This example also demonstrates the entry indicators flashing when their values
    are updated (enabled / disabled with the <code>flashOnUpdate</code>-prop)
  </p>

  <Inspect.Values.Expand0 {...value} />
</div>
