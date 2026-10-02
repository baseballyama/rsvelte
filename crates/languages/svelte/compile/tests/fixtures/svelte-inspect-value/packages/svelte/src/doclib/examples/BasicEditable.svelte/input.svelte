<script lang="ts">
  import Inspect from '$lib/index.js'
  import { GLOBAL_OPTIONS_CONTEXT, type InspectOptions } from '$lib/options.svelte.js'
  import { getContext } from 'svelte'
  import type { SvelteMap } from 'svelte/reactivity'
  import ToggleButton from '../../routes/(app)/ToggleButton.svelte'
  import Editor from '../Editor.svelte'
  import Stack from '../Stack.svelte'

  const original = `({ // edit me!
  id: undefined,
  firstName: 'Bob',
  lastName: 'Alice',
  email: 'bob@alice.lol',
  introduction: \`The name is Alice.\\n\\n\\t\\tBob Alice.\`,
  birthDate: new Date('1970-01-01'),
  website: new URL('https://alice.bob/?ref=abcd#about'),
  age: -42,
  emailVerified: true,
  interests: ['radio', 'tv', 'internet', 'kayaks', null],
  jsonString: '[{ "message": "i can be parsed if desired" }]'
});`

  let demoInputValid = $state(true)

  let sourceValue = $state(original)
  let value = $state(eval(original))

  function reset() {
    sourceValue = original
    value = eval(sourceValue)
    editor?.editor()?.setValue(original)
  }

  let error = $state<string>()
  function onchange(val: string) {
    try {
      const obj = eval(val)
      value = obj
      demoInputValid = true
      error = undefined
    } catch (e) {
      if (e instanceof Error) {
        error = e.message
      }
      demoInputValid = false
    }
  }

  getContext<SvelteMap<string, string>>('toc')?.set('JSON', 'json')
  const globalInspectOptions = getContext<() => InspectOptions>(GLOBAL_OPTIONS_CONTEXT)()
  let editor = $state<ReturnType<typeof Editor>>()
  const setOption =
    getContext<(name: keyof InspectOptions, value: unknown) => void>('set-global-option')
</script>

<div class="flex col">
  <h3 id="json">JSON</h3>
  <p>
    <code>Inspect</code> works well for basic object and array-values aka "JSON".<br />
    If needed, strings that start with <code>'['</code> or <code>{`'{'`}</code> can be parsed. Try
    it:
    <span style="margin-left: 0.5em;">
      <ToggleButton
        duration={0}
        bind:checked={() => globalInspectOptions.parseJson, (val) => setOption('parseJson', val)}
      >
        parse json
      </ToggleButton>
    </span>
  </p>
  <button onclick={() => reset()}>reset</button>
  <Stack>
    <Editor
      bind:this={editor}
      value={sourceValue}
      {onchange}
      valid={demoInputValid}
      message={error}
    />
    <Inspect {value} name="demo" />
  </Stack>
</div>

<style>
  .flex {
    width: 100%;
  }
</style>
