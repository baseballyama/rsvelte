<script lang="ts">
  import Inspect from '$lib/index.js'
  // import Inspect, { configured } from '$lib/index.js'
  // console.dir(Inspect.Values)

  let noanimate = $state(false)
  let opts = $derived({ noanimate })

  // const CustomInspect = Inspect.Values.withOptions(() => ({ theme: 'inspect' }))
  // const CustomInspect = configured(() => ({ theme: 'inspect' }))

  // const AnimatedInspect = CustomInspect.withOptions(() => opts)
  // const Configured2 = AnimatedInspect.withOptions(() => ({ showPreview: true }))
  // const Configured3 = Configured2.withOptions(() => ({ borderless: false }))
  // const Configured4 = Configured3.withOptions(() => ({ showTypes: false, theme: 'drak' }))

  let anObject = $state<Record<string, unknown>>({})

  // function create() {
  //   console.time('create')
  //   const ret = Inspect.Values.Config.Borderless.Ok
  //   console.timeEnd('create')
  //   return ret
  // }

  let Component = Inspect.Values.withOptions(() => opts)
</script>

<div>
  <label>
    noanimate
    <input type="checkbox" bind:checked={noanimate} />
  </label>

  <button onclick={() => (anObject['a'] = 'a')}>add</button>
  <!-- <button onclick={() => (Component = create())}>create</button> -->
</div>

<Component.Config.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.NoTools.Ok
  a
  b
  c
/>

<!-- <Inspect.Values.DefaultTheme {...anObject} />

<CustomInspect message="hello i am custom and have inspect theme" /> -->

<!-- <Configurable message="hello" /> -->
<!-- <AnimatedInspect message="hello i add noanimate" />
<Configured2 message="hello i add showPreview" />
<Configured3.Expand10 message="hello i add borderless" />
<Configured4 message="hello i add showtypes and dark" />

<Inspect.Values {inspect} {anything} /> -->

<!-- <Inspect.Values.Config.Borderless.Ok msg="quick config!" /> -->
