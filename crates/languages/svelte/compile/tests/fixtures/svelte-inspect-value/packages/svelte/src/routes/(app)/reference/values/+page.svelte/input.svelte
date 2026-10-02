<script lang="ts">
  import Code from '$doclib/Code.svelte'
  import ConfiguredExample from '$doclib/examples/ConfiguredExample.svelte'
  import MinimalExampleValues from '$doclib/examples/MinimalExampleValues.svelte'
  import configuredCode from '$doclib/examples/configured.txt?raw'
  import inlineconfigcode from '$doclib/examples/inlineconfig.txt?raw'
  import valuesCode from '$doclib/examples/inspectvalueexample.txt?raw'
  import { createPageTitle } from '$doclib/util.js'

  const toc = new Map([
    ['Configuring', 'configuring'],
    ['Chainable inline configuration', 'chainable'],
  ])
</script>

<svelte:head>
  <title>{createPageTitle('Inspect.Values')}</title>
</svelte:head>

<div class="toc">
  {#each toc as [title, id] (id)}
    <a href={`#${id}`}>{title} </a>
    <hr />
  {/each}
</div>

<h2 id="values">Inspect.Values</h2>

<p>
  <code>Inspect.Values</code> is a version of <code>Inspect</code> that will display any prop/value
  passed to it, instead of having to use the <code>value(s)</code> prop.
</p>

<Code code={valuesCode}></Code>

Result:
<div class="center">
  <MinimalExampleValues />
</div>

<h2 id="configuring">Configuring</h2>

<p>
  <code>Inspect.Values</code> does not accept any configuration props since any value passed as a
  prop will simply be inspected. If you want to change the behavior of <code>Inspect.Values</code>
  you can use <a href="/docs/functions/setGlobalInspectOptions">global options</a> or define a
  pre-configured version of the component with
  <code>Inspect.Values.withOptions</code>
  or the <code><a href="/docs/functions/configured">configured</a></code>-function:
</p>

<Code code={configuredCode} />

<p>
  <code>Inspect.Values</code> and configured variants can all have <code>expandLevel</code> set by using
  "Expand" properties from 0 to 10 (default 1.)
</p>

Result:
<div class="center">
  <ConfiguredExample />
</div>

<h2 id="chainable">Chainable inline configuration</h2>

<p>
  A final method to configuring <code>Inspect.Values</code> that will override global options and
  <code>withOptions</code>-variations is "chainable inline configuration":
</p>

<Code code={inlineconfigcode} />
