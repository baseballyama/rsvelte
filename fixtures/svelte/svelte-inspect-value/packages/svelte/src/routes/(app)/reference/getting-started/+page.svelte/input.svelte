<script lang="ts">
  import Code from '$doclib/Code.svelte'
  import globalConfigCode from '$doclib/examples/globalconfig.txt?raw'
  import globalConfigCodeLayout from '$doclib/examples/globalconfiglayout.txt?raw'
  import MinimalExample from '$doclib/examples/MinimalExample.svelte'
  import minimalcode from '$doclib/examples/minimalexample.txt?raw'
  import MultiCode from '$doclib/examples/MultiCode.svelte'
  import { createPageTitle } from '$doclib/util.js'
  import Inspect from '$lib/index.js'
  import { SvelteMap } from 'svelte/reactivity'

  let { data } = $props()
  let { minimalCode } = $derived(data.codeSamples)

  const packageName = 'svelte-inspect-value'
  let stringCollapse = $state(20)

  const toc = new SvelteMap<string, string>([
    ['Usage & Conditional Rendering', 'usage'],
    ['Global Options', 'global'],
  ])
</script>

<svelte:head>
  <title>{createPageTitle('Getting Started')}</title>
</svelte:head>

<div class="toc">
  {#each toc as [title, id] (id)}
    <a href={`#${id}`}>{title} </a>
    <hr />
  {/each}
</div>

<h2 id="getting-started">Getting Started</h2>

<p>
  Install <code>{packageName}</code> with your favorite package manager.<br />

  Importing <code>Inspect</code> from <code>{packageName}</code> makes three components available:<br
  />
  <code>Inspect</code>, <code>Inspect.Panel</code>, and <code>Inspect.Values</code>
</p>

<h3 id="usage">Usage & Conditional Rendering</h3>

<p>
  A common use case for a component like this is to only render it during development.<br />If you
  are using SvelteKit, you can conditionally render Inspect using the <code>dev</code> variable
  exported from
  <code>'$app/environment'</code>.<br />
  If you are not using SvelteKit or Vite,
  <a href="https://github.com/benmccann/esm-env/tree/main"><code>esm-env</code></a> is a good alternative
  for checking conditional environment variables with different bundlers and runtimes.
</p>

<Code code={minimalcode}>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html minimalCode}
</Code>

<h3>Result:</h3>
<div class="center">
  <MinimalExample />
</div>

<h3 id="global">Global Options</h3>

<p>
  <code>{packageName}</code> exports a utility function to set a "global" config for every instance
  of the Inspect-components in or under the component where the function is called (it sets
  context). Alternatively, you can use the <code>InspectOptionsProvider</code>-component.
</p>

<p>
  Passing a function returning a reactive object to the function will update the components if any
  property of the object is changed.<br />

  You can try this now if you change any options in the configurator at the bottom of the
  navigation-menu.
</p>

<MultiCode
  examples={[
    { code: globalConfigCodeLayout, label: '+layout.svelte', language: 'svelte' },
    { code: globalConfigCode, label: '+page.svelte', language: 'svelte' },
  ]}
/>

Result:

<label>
  string collapse
  <input type="number" bind:value={stringCollapse} />
</label>
<Inspect value={'no long strings in this neighbourhood thanks'} {stringCollapse} />

<p>
  Options set with props, <code
    ><a href="/docs/types/Configurable#with-options">Inspect.Values.withOptions</a></code
  >
  or <code><a href="/docs/functions/configured">configured</a></code> will override any global options
</p>

<style>
  .center {
    display: flex;
    justify-content: center;
  }
</style>
