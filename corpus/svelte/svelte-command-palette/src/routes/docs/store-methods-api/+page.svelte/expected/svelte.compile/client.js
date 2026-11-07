import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(
	`<h1>createStoreMethods API</h1> <p class="lead svelte-2wiflo">The <code>createStoreMethods</code> function provides methods to programmatically 
	control the command palette's visibility.</p> <h2>Basic Usage</h2> <div class="code-block"><div class="code-block-header"><div class="dots"><span class="dot"></span> <span class="dot"></span> <span class="dot"></span></div> <span>Store Methods</span></div> <pre><code></code></pre></div> <h2>Available Methods</h2> <div class="methods-grid svelte-2wiflo"><div class="method-card svelte-2wiflo"><h3 class="svelte-2wiflo"><code>openPalette()</code></h3> <p class="svelte-2wiflo">Opens the command palette and focuses the search input</p> <code class="method-return svelte-2wiflo">Returns: void</code></div> <div class="method-card svelte-2wiflo"><h3 class="svelte-2wiflo"><code>closePalette()</code></h3> <p class="svelte-2wiflo">Closes the palette and clears the search input</p> <code class="method-return svelte-2wiflo">Returns: void</code></div> <div class="method-card svelte-2wiflo"><h3 class="svelte-2wiflo"><code>togglePalette()</code></h3> <p class="svelte-2wiflo">Toggles the palette visibility</p> <code class="method-return svelte-2wiflo">Returns: void</code></div></div> <h2>With Palette Store</h2> <p>Combine with <code>paletteStore</code> for reactive state:</p> <div class="code-block"><div class="code-block-header"><div class="dots"><span class="dot"></span> <span class="dot"></span> <span class="dot"></span></div> <span>Reactive Store</span></div> <pre><code></code></pre></div> <h2>Inside Action Callbacks</h2> <p>Store methods are automatically available in action callbacks:</p> <div class="code-block"><div class="code-block-header"><div class="dots"><span class="dot"></span> <span class="dot"></span> <span class="dot"></span></div> <span>Action Callbacks</span></div> <pre><code></code></pre></div> <h2>Store Properties</h2> <p>The <code>paletteStore</code> contains:</p> <div class="table-wrapper svelte-2wiflo"><table><thead><tr><th>Property</th><th>Type</th><th>Description</th></tr></thead><tbody><tr><td><code>isVisible</code></td><td><code>boolean</code></td><td>Whether palette is currently open</td></tr><tr><td><code>textInput</code></td><td><code>string</code></td><td>Current search query</td></tr><tr><td><code>commands</code></td><td><code>action[]</code></td><td>All registered actions</td></tr><tr><td><code>results</code></td><td><code>action[]</code></td><td>Filtered search results</td></tr><tr><td><code>activeCommandId</code></td><td><code>string | number | null</code></td><td>Currently highlighted action</td></tr><tr><td><code>calledActions</code></td><td><code>Array&lt;ActionId&gt;</code></td><td>History of executed action IDs</td></tr></tbody></table></div>`,
	1
);

export default function _page($$anchor) {
	const basicUsage = `import { createStoreMethods } from '$lib';

// Create store methods instance
const { openPalette, closePalette, togglePalette } = createStoreMethods();

// Open programmatically
function handleButtonClick() {
  openPalette();
}

// Close with custom logic
function handleSave() {
  saveData();
  closePalette();
}

// Toggle visibility
function handleKeyPress(event) {
  if (event.key === 'p' && event.metaKey) {
    togglePalette();
  }
}`;

	const withStore = `<script lang="ts">
  import { paletteStore, createStoreMethods } from '$lib';
  
  const { openPalette, closePalette } = createStoreMethods();
  
  // React to store changes
  $: if ($paletteStore.isVisible) {
    console.log('Palette opened');
  }
  
  // Access called actions history
  $: recentActions = $paletteStore.calledActions;
<\/script>

<button on:click={openPalette}>
  Open Palette
</button>

{#if recentActions.length > 0}
  <p>Last action: {recentActions[recentActions.length - 1]}</p>
{/if}`;

	const inActions = `const actions = defineActions([
  {
    title: 'Close and Navigate',
    onRun: ({ storeMethods }) => {
      // storeMethods is available in callbacks
      storeMethods.closePalette();
      goto('/dashboard');
    }
  },
  {
    title: 'Keep Open',
    onRun: ({ action, storeProps }) => {
      // Access current state
      console.log('Current search:', storeProps.textInput);
      console.log('Active command:', storeProps.activeCommandId);
      // Don't close - palette stays open
    }
  }
]);`;

	var fragment = root();
	var div = $.sibling($.first_child(fragment), 6);
	var pre = $.sibling($.child(div), 2);
	var code = $.child(pre);

	code.textContent = 'import { createStoreMethods } from \'$lib\';\n\n// Create store methods instance\nconst { openPalette, closePalette, togglePalette } = createStoreMethods();\n\n// Open programmatically\nfunction handleButtonClick() {\n  openPalette();\n}\n\n// Close with custom logic\nfunction handleSave() {\n  saveData();\n  closePalette();\n}\n\n// Toggle visibility\nfunction handleKeyPress(event) {\n  if (event.key === \'p\' && event.metaKey) {\n    togglePalette();\n  }\n}';
	$.reset(pre);
	$.reset(div);

	var div_1 = $.sibling(div, 10);
	var pre_1 = $.sibling($.child(div_1), 2);
	var code_1 = $.child(pre_1);

	code_1.textContent = '<script lang="ts">\n  import { paletteStore, createStoreMethods } from \'$lib\';\n  \n  const { openPalette, closePalette } = createStoreMethods();\n  \n  // React to store changes\n  $: if ($paletteStore.isVisible) {\n    console.log(\'Palette opened\');\n  }\n  \n  // Access called actions history\n  $: recentActions = $paletteStore.calledActions;\n</script>\n\n<button on:click={openPalette}>\n  Open Palette\n</button>\n\n{#if recentActions.length > 0}\n  <p>Last action: {recentActions[recentActions.length - 1]}</p>\n{/if}';
	$.reset(pre_1);
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 6);
	var pre_2 = $.sibling($.child(div_2), 2);
	var code_2 = $.child(pre_2);

	code_2.textContent = 'const actions = defineActions([\n  {\n    title: \'Close and Navigate\',\n    onRun: ({ storeMethods }) => {\n      // storeMethods is available in callbacks\n      storeMethods.closePalette();\n      goto(\'/dashboard\');\n    }\n  },\n  {\n    title: \'Keep Open\',\n    onRun: ({ action, storeProps }) => {\n      // Access current state\n      console.log(\'Current search:\', storeProps.textInput);\n      console.log(\'Active command:\', storeProps.activeCommandId);\n      // Don\'t close - palette stays open\n    }\n  }\n]);';
	$.reset(pre_2);
	$.reset(div_2);
	$.next(6);
	$.append($$anchor, fragment);
}