<script lang="ts">
  import AllTypes from '$doclib/examples/AllTypes.svelte'
  import { createPageTitle } from '$doclib/util.js'

  const toc = new Map([
    ['Default Shortcuts', 'default'],
    ['Keyboard Navigation', 'keyboard'],
    ['Type to focus', 'type-to-focus'],
  ])
</script>

<svelte:head>
  <title>{createPageTitle('Hotkeys')}</title>
</svelte:head>

{#snippet metaKey()}
  <kbd><dfn title="⌘ or Ctrl">Meta</dfn></kbd>
  <!-- <kbd>⌘</kbd> <span style="font-weight: bolder;">/</span> <kbd>Ctrl</kbd> -->
{/snippet}

<div class="toc">
  {#each toc as [title, id] (id)}
    <a href={`#${id}`}>{title} </a>
    <hr />
  {/each}
</div>

<h2 id="hotkeys">Hotkeys</h2>

<h3 id="default">Default keyboard shortcuts and configuration</h3>

<p>
  The three following hotkeys are enabled by default. They can be overriden or disabled by setting
  the <a href="/docs/types/InspectOptions#hotkeys"><code>hotkeys</code> prop / option</a>.<br />
  See <a href="/docs/types/InspectHotkeys"><code>InspectHotkeys</code></a> type for how to override.
</p>

<table>
  <tbody>
    <tr>
      <td>
        {@render metaKey()} + <kbd>&rightarrow;</kbd>
      </td>
      <td> Expand top level nodes </td>
    </tr>
    <tr>
      <td>
        {@render metaKey()} + <kbd>&leftarrow;</kbd>
      </td>
      <td> Collapse top level nodes </td>
    </tr>
    <tr>
      <td><kbd>Shift</kbd> + {@render metaKey()} + <kbd>F</kbd></td>
      <td> Focus search field (if enabled) </td>
    </tr>
  </tbody>
</table>

<p style="font-weight: bold; font-style: italic">
  Note: {@render metaKey()} means <kbd>⌘</kbd> on macOS and <kbd>Ctrl</kbd> on Windows / Linux
</p>

<h3 id="keyboard">Keyboard navigation</h3>

<p>
  Every node/row/line in <code>Inspect</code> is focusable, and can be navigated, expanded or
  collapsed using the following keys. Using <kbd>Tab</kbd> in combination with the following
  keyboard shortcuts, everything should be reachable using only your keyboard.<br />

  This can be disabled by setting option / prop <code>disableKeyNav</code> to <code>true</code>.
</p>

<table>
  <tbody>
    <tr>
      <td>
        <kbd>&uparrow;</kbd>
      </td>
      <td> Focus previous node </td>
    </tr>
    <tr>
      <td>
        <kbd>&downarrow;</kbd>
      </td>
      <td> Focus next node </td>
    </tr>
    <tr>
      <td>
        <kbd>End</kbd>
      </td>
      <td> Focus last node </td>
    </tr>
    <tr>
      <td>
        <kbd>Home</kbd>
      </td>
      <td> Focus first node </td>
    </tr>
    <tr>
      <td>
        <kbd>&rightarrow;</kbd>
      </td>
      <td>
        If collapsed: expand node<br />
        If expanded: focus previously expanded child node<br />
        Non expandable: focus next node
      </td>
    </tr>
    <tr>
      <td>
        <kbd>&leftarrow;</kbd>
      </td>
      <td>
        If collapsed: focus parent node / focus previous node<br />
        If expanded: collapse node<br />
        Non expandable: focus previous mode
      </td>
    </tr>
    <tr>
      <td>
        <kbd>Enter</kbd>
      </td>
      <td> Expand node and focus first child </td>
    </tr>
    <tr>
      <td>
        <kbd>Space</kbd>
      </td>
      <td> Expand / collapse node </td>
    </tr>
  </tbody>
</table>

<h3 id="type-to-focus">Type to focus</h3>

<p>
  While a node is focused, you can type to focus a certain (visible) node.<br />
  A box will appear showing your query, and a node matching the typed letters will be focused, prioritizing
  keys. This can be disabled by setting the prop / option <code>typeToFocus</code> to
  <code>false</code>
</p>

<AllTypes search="highlight" disableKeynav={false} />

<style>
  table {
    border: 1px solid var(--docs-border-color);
    border-collapse: collapse;
  }

  td {
    border: 1px solid var(--docs-border-color);
    padding: 1ch;
    text-align: left;
    white-space: nowrap;
  }

  td:first-of-type {
    font-family: monospace;
  }
</style>
