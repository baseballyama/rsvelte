import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	const storeExample = `import { paletteStore } from '$lib';

// Subscribe to store changes
paletteStore.subscribe((state) => {
  console.log('Visibility:', state.isVisible);
  console.log('Search text:', state.textInput);
  console.log('Active command:', state.activeCommandId);
  console.log('Called actions:', state.calledActions);
});

// Update the store
paletteStore.update((state) => ({
  ...state,
  textInput: 'prefilled search',
  isVisible: true
}));`;

	const storeMethodsExample = `import { createStoreMethods } from '$lib';

// Create store methods
const { openPalette, closePalette, togglePalette } = createStoreMethods();

// Open programmatically
<button onclick={() => openPalette()}>
  Open Command Palette
</button>

// Or toggle
document.addEventListener('keydown', (e) => {
  if (e.key === 'p' && e.metaKey) {
    togglePalette();
  }
});`;

	const customStateExample = `// Add custom state to track user preferences
paletteStore.update((state) => ({
  ...state,
  // Your custom properties
  lastUsedActions: [],
  favoriteActions: ['action-1', 'action-2'],
  settings: {
    showDescriptions: true,
    maxResults: 10
  }
}));

// Access in action callbacks
const actions = defineActions([
  {
    title: 'Toggle Descriptions',
    onRun: ({ storeProps }) => {
      paletteStore.update(s => ({
        ...s,
        settings: {
          ...s.settings,
          showDescriptions: !storeProps.settings.showDescriptions
        }
      }));
    }
  }
]);`;

	$$renderer.push(`<h1>Palette Store</h1> <p class="lead svelte-is21r0">The palette store is a standard Svelte store that holds all command palette state. 
	Subscribe to it, update it, and extend it with your own properties.</p> <h2>Store Structure</h2> <p>The store contains the following properties:</p> <div class="table-wrapper svelte-is21r0"><table><thead><tr><th>Property</th><th>Type</th><th>Description</th></tr></thead><tbody><tr><td><code>isVisible</code></td><td><code>boolean</code></td><td>Whether the palette is currently open</td></tr><tr><td><code>textInput</code></td><td><code>string</code></td><td>Current search query</td></tr><tr><td><code>commands</code></td><td><code>action[]</code></td><td>All registered actions</td></tr><tr><td><code>results</code></td><td><code>action[]</code></td><td>Filtered search results</td></tr><tr><td><code>activeCommandId</code></td><td><code>string | number | null</code></td><td>Currently highlighted action ID</td></tr><tr><td><code>selectedCommandId</code></td><td><code>string | number | null</code></td><td>Last selected action ID</td></tr><tr><td><code>calledActions</code></td><td><code>Array&lt;ActionId></code></td><td>History of executed action IDs</td></tr><tr><td><code>actionMap</code></td><td><code>object</code></td><td>Map of actionId to action object</td></tr><tr><td><code>storeMethods</code></td><td><code>object</code></td><td>Methods to control the palette</td></tr></tbody></table></div> <h2>Subscribing &amp; Updating</h2> <p>Use standard Svelte store patterns to interact with the palette:</p> <div class="code-block"><div class="code-block-header"><div class="dots"><span class="dot"></span> <span class="dot"></span> <span class="dot"></span></div> <span>Store Usage</span></div> <pre><code>import { paletteStore } from '$lib';

// Subscribe to store changes
paletteStore.subscribe((state) => {
  console.log('Visibility:', state.isVisible);
  console.log('Search text:', state.textInput);
  console.log('Active command:', state.activeCommandId);
  console.log('Called actions:', state.calledActions);
});

// Update the store
paletteStore.update((state) => ({
  ...state,
  textInput: 'prefilled search',
  isVisible: true
}));</code></pre></div> <h2>Store Methods</h2> <p>Use <code>createStoreMethods()</code> to get helper functions:</p> <div class="code-block"><div class="code-block-header"><div class="dots"><span class="dot"></span> <span class="dot"></span> <span class="dot"></span></div> <span>Store Methods</span></div> <pre><code>import { createStoreMethods } from '$lib';

// Create store methods
const { openPalette, closePalette, togglePalette } = createStoreMethods();

// Open programmatically
&lt;button onclick={() => openPalette()}>
  Open Command Palette
&lt;/button>

// Or toggle
document.addEventListener('keydown', (e) => {
  if (e.key === 'p' &amp;&amp; e.metaKey) {
    togglePalette();
  }
});</code></pre></div> <h3>Available Methods</h3> <div class="methods-grid svelte-is21r0"><div class="method-card svelte-is21r0"><h4 class="svelte-is21r0"><code>openPalette()</code></h4> <p class="svelte-is21r0">Opens the command palette and focuses the search input</p></div> <div class="method-card svelte-is21r0"><h4 class="svelte-is21r0"><code>closePalette()</code></h4> <p class="svelte-is21r0">Closes the palette and clears the search</p></div> <div class="method-card svelte-is21r0"><h4 class="svelte-is21r0"><code>togglePalette()</code></h4> <p class="svelte-is21r0">Toggles the palette visibility</p></div></div> <h2>Extending the Store</h2> <p>Add your own properties to track custom state:</p> <div class="code-block"><div class="code-block-header"><div class="dots"><span class="dot"></span> <span class="dot"></span> <span class="dot"></span></div> <span>Custom State</span></div> <pre><code>// Add custom state to track user preferences
paletteStore.update((state) => ({
  ...state,
  // Your custom properties
  lastUsedActions: [],
  favoriteActions: ['action-1', 'action-2'],
  settings: {
    showDescriptions: true,
    maxResults: 10
  }
}));

// Access in action callbacks
const actions = defineActions([
  {
    title: 'Toggle Descriptions',
    onRun: ({ storeProps }) => {
      paletteStore.update(s => ({
        ...s,
        settings: {
          ...s.settings,
          showDescriptions: !storeProps.settings.showDescriptions
        }
      }));
    }
  }
]);</code></pre></div> <div class="callout svelte-is21r0"><div class="callout-icon svelte-is21r0">💡</div> <div class="callout-content svelte-is21r0"><strong class="svelte-is21r0">Pro tip:</strong> The <code>calledActions</code> array persists across palette opens. 
		Use it to implement features like "recently used" or conditional action chains.</div></div> <h2>Reactive Store in Components</h2> <p>Access the store reactively in Svelte components:</p> <div class="code-block"><div class="code-block-header"><div class="dots"><span class="dot"></span> <span class="dot"></span> <span class="dot"></span></div> <span>+page.svelte</span></div> <pre><code>&lt;script>
  import { paletteStore } from '$lib'; // Use 'svelte-command-palette' in your project
  
  // Reactive access
  $: isOpen = $paletteStore.isVisible;
  $: searchQuery = $paletteStore.textInput;
  $: resultCount = $paletteStore.results.length;
&lt;/script>

{#if isOpen}
  &lt;div class="status">
    Searching: "{searchQuery}" ({resultCount} results)
  &lt;/div>
{/if}</code></pre></div>`);
}