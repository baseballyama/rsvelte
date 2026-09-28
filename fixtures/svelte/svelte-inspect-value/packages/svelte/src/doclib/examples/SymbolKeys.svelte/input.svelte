<script lang="ts">
  import Inspect from '$lib/index.js'
  import { getContext } from 'svelte'
  import type { SvelteMap } from 'svelte/reactivity'

  import Code from '../Code.svelte'
  import Stack from '../Stack.svelte'
  import code from './symbolkeys.txt?raw'

  getContext<SvelteMap<string, string>>('toc')?.set('Symbol keys', 'symbols')
</script>

<div class="flex col">
  <h3 id="symbols">Symbol keys</h3>
  <p>
    Object properties where keys are symbols are displayed. these are skipped by
    <code>JSON.stringify()</code>
    or <code>Object.keys()</code><br />
  </p>

  <Stack>
    <Code {code} language="javascript" />

    <Inspect
      value={{
        stringKey: 'string value',
        anotherKey: 2,
        [Symbol('i am key')]: 'my key is a symbol',
      }}
      name="objectWithSymbolKey"
      style="max-width: 400px;"
      expandAll
    />
  </Stack>
</div>
