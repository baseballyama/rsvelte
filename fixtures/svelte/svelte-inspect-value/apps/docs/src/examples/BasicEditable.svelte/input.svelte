<script lang="ts">
  import { Inspect } from '@components'
  import Editor from '@components/editor/CodeEditor.svelte'

  const original = `{ // edit me!
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
  jsonString: '[{ "message": "i can be parsed" }]'
}`

  let demoInputValid = $state(true)
  let sourceValue = $state(original)
  let value = $state(evaluate(original))

  function reset() {
    sourceValue = original
    value = evaluate(sourceValue)
    editor?.setValue(original)
  }

  let error = $state<string>()
  function onchange(val: string) {
    try {
      const obj = evaluate(val)
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

  function evaluate(val: string) {
    return eval(`(${val})`)
  }

  let editor = $state<ReturnType<typeof Editor>>()
</script>

<div class="editor">
  <button class="reset-button" onclick={() => reset()} style="float: right;">reset</button>

  <Editor
    bind:this={editor}
    value={sourceValue}
    {onchange}
    valid={demoInputValid}
    message={error}
  />
</div>
<Inspect {value} name="demo"></Inspect>

<style>
  .editor {
    position: relative;
  }

  .reset-button {
    position: absolute;
    right: 0.5em;
    bottom: 0.5em;
    z-index: 10;
    font-family: monospace;
  }
</style>
