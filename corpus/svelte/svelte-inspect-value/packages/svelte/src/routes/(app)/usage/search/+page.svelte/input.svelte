<script lang="ts">
  import AllTypes from '$doclib/examples/AllTypes.svelte'
  import { createPageTitle } from '$doclib/util.js'

  const toc = new Map([
    ['Search', 'search'],
    ['- Multiple Terms', 'multiple-terms'],
    ['- Expanding Matches', 'expanding-matches'],
  ])
</script>

<svelte:head>
  <title>{createPageTitle('Search')}</title>
</svelte:head>

<div class="toc">
  {#each toc as [title, id] (id)}
    <a href={`#${id}`}>{title} </a>
    <hr />
  {/each}
</div>

<h2 id="search">Search</h2>

<p>
  If <code><a href="/docs/types/InspectOptions#search">search</a></code> is enabled, a search input
  will be visible in the header.<br />
  Typing a query and hitting enter will index the inspected values, search it and highlight any paths
  with keys, paths and values that matches the query.
</p>

<p>Search results can be narrowed by using multiple terms and the following prefixes:</p>
<ul>
  <li>
    <code>value:</code> to search the content of the value, e.g. <code>true</code> /
    <code>'foo'</code>
    / <code>12356n</code>
  </li>
  <li>
    <code>type:</code> to search for values that matches a specific type, e.g. <code>number</code> /
    <code>boolean</code>
    / <code>date</code>
  </li>
  <li>
    <code>key:</code> to search within a values key
  </li>
  <li>
    <code>path:</code> to search within the path to a value, e.g.
    <code>people.3.contact.email</code>
  </li>
</ul>

<p>
  Wrapping terms in quotes will require an exact match. With a prefix it would look like
  <code>value:"1234" </code>
</p>

<h3 id="multiple-terms">Multiple terms</h3>

<p>
  If multiple terms are entered (separated by space) a mode-selector appears letting you choose
  between <code>and</code> / <code>or</code>-mode. The initial mode can be set with the
  <a href="/docs/types/InspectOptions#search-mode"><code>searchMode</code></a>-prop.
</p>

<p>
  For example, querying <code>type:"string" path:foo</code> would match all string values and / or
  values with
  <code>'foo'</code> in their path / key.
</p>

<h3 id="expanding-matches">Expanding matches</h3>

<p>
  All matching paths will be expanded. To keep highlighted matching paths expanded after clearing
  the search results, hit <kbd>Enter</kbd> again without changing the query.<br />
  The <kbd>Esc</kbd>-button will clear the input and search results when the search field is
  focused, and if the search field was focused using the keyboard shortcut, the last focused node
  will be re-focused.
</p>

<p>
  If <a href="/docs/types/InspectOptions#highlight-matches"><code>highlightMatches</code></a> is
  enabled, matching text will be highlighted when you type your query.<br />
  Text highlighting also respects prefixes like <code>path</code> and <code>type</code>.
</p>

<p>
  <b>Note:</b> Text highlighting and indexed search works a bit differently. For example, the query
  <code>type:undefined type:null</code>
  will highlight any visible value with type
  <code>undefined</code>
  and <code>null</code> regardless of search mode, but since a value can't be both
  <code>undefined</code>
  and <code>null</code> at the same time, no values will be a match in <code>and</code>-mode. So,
  even if something is highlighted it might not count as a match.
</p>

<AllTypes search="highlight" highlightMatches />
