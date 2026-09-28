<script lang="ts">
  import BasicEditable from '$doclib/examples/BasicEditable.svelte'
  import Classes from '$doclib/examples/Classes.svelte'
  import EmbedMedia from '$doclib/examples/EmbedMedia.svelte'
  import Functions from '$doclib/examples/Functions.svelte'
  import GettersAndSetters from '$doclib/examples/GettersAndSetters.svelte'
  import HtmlElements from '$doclib/examples/HTMLElements.svelte'
  import Iterators from '$doclib/examples/Iterators.svelte'
  import MapAndSet from '$doclib/examples/MapAndSet.svelte'
  import MultiLineStrings from '$doclib/examples/MultiLineStrings.svelte'
  import Other from '$doclib/examples/Other.svelte'
  import Promises from '$doclib/examples/Promises.svelte'
  import Stores from '$doclib/examples/Stores.svelte'
  import Urls from '$doclib/examples/Urls.svelte'
  import { createPageTitle } from '$doclib/util.js'
  import { PanelValue } from '$lib/index.js'
  import { setContext } from 'svelte'
  import { SvelteMap } from 'svelte/reactivity'

  let { data } = $props()

  let { codeSamples } = $derived(data)

  const toc = new SvelteMap<string, string>()

  setContext('toc', toc)
</script>

<svelte:head>
  <title>{createPageTitle('Examples')}</title>
</svelte:head>

<PanelValue key="toc" value={toc} />

<div class="toc">
  {#each toc as [title, id] (id)}
    <a href={`#${id}`}>{title} </a>
    <hr />
  {/each}
</div>

<h2>Examples</h2>

<BasicEditable />
<MultiLineStrings />
<MapAndSet />
<Promises code={codeSamples.promises} />
<Stores />
<HtmlElements />
<Classes />
<Functions />
<Urls />
<GettersAndSetters code={codeSamples.gettersAndSetters} />
<Iterators code={codeSamples.iterators} />
<EmbedMedia />
<Other />
