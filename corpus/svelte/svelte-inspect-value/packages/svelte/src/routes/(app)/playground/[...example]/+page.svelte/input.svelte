<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/state'
  import Editor from '$doclib/Editor.svelte'
  import Inspect from '$lib/Inspect.svelte'
  import type { InspectProps } from '$lib/types.js'
  import { getType } from '$lib/util.js'
  import examples from './examples.js'

  type ExampleKey = keyof typeof examples

  const exampleKeys = Object.keys(examples) as string[]

  function isValidExampleKey(str: string): str is ExampleKey {
    return exampleKeys.includes(str)
  }

  let urlName: ExampleKey = $derived.by(() => {
    const slug = page.params.example?.split('-').join(' ')
    if (slug && isValidExampleKey(slug)) {
      return slug
    }
    return 'primitives'
  })

  let original = $derived(examples[urlName])
  let demoInputValid = $state(true)

  // svelte-ignore state_referenced_locally
  let sourceValue = $state(original)
  let value = $state({ name: 'Dinky Doodlebop', age: 42 })

  let valueType = $derived(getType(value))

  let props = $derived<InspectProps>({
    value,
    values: ['map', 'set', 'array', 'object'].includes(valueType) ? value : undefined,
  })

  function reset() {
    sourceValue = original
    onchange(sourceValue)
    editor?.editor()?.setValue(original)
  }

  let error = $state<string>()
  function onchange(val: string) {
    try {
      const func = new Function(val)
      value = func()
      demoInputValid = true
      error = undefined
    } catch (e) {
      if (e instanceof Error) {
        error = e.message
      }
      demoInputValid = false
    }
  }

  let editor = $state<ReturnType<typeof Editor>>()

  $effect(() => {
    onchange(examples[urlName])
    reset()
  })
</script>

<h2>Playground</h2>

<div class="container">
  <div class="flex row align-end justify-between w-max">
    <button onclick={() => reset()}>reset</button>
    <label>
      examples
      <select
        value={urlName}
        onchange={(e) => {
          const value = e.currentTarget.value.split(' ').join('-')
          goto(`/playground/${value}`)
          // original = sourceValue
          // onchange(sourceValue)
        }}
      >
        {#each Object.entries(examples) as [name] (name)}
          <option>{name}</option>
        {/each}
      </select>
    </label>
  </div>
  <div class="playground">
    <Editor
      bind:this={editor}
      value={sourceValue}
      {onchange}
      valid={demoInputValid}
      message={error}
    />
    <Inspect {...props} name="demo" expandLevel={1} heading="playground" />
  </div>
</div>

<style>
  .container {
    container-type: inline-size;
  }

  .playground {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5em;
    width: 100%;

    @container (inline-size > 800px) {
      flex-direction: row;
    }
  }
</style>
