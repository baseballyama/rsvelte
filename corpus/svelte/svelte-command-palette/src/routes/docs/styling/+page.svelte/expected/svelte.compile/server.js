import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	const basicStyling = `<CommandPalette
  commands={actions}
  
  <!-- Use CSS classes (works with Tailwind!) -->
  inputClass="rounded-lg border-gray-200 focus:ring-2"
  resultContainerClass="hover:bg-gray-50"
  optionSelectedClass="bg-blue-50 border-l-2 border-blue-500"
  
  <!-- Or inline styles (CSS Properties) -->
  inputStyle={{ fontSize: '16px', padding: '1rem' }}
  overlayStyle={{ backdropFilter: 'blur(8px)' }}
/>`;

	const darkModeExample = `<script>
  let isDark = $state(false);
  
  const darkTheme = {
    inputStyle: { background: '#1f2937', color: '#f9fafb' },
    paletteWrapperInnerStyle: { 
      background: '#1f2937',
      boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
    },
    resultContainerStyle: { borderColor: '#374151' },
    optionSelectedStyle: { background: '#374151' }
  };
  
  const lightTheme = {
    inputStyle: { background: '#ffffff', color: '#111827' },
    paletteWrapperInnerStyle: { background: '#ffffff' },
    resultContainerStyle: { borderColor: '#e5e7eb' },
    optionSelectedStyle: { background: '#f3f4f6' }
  };
  
  const theme = $derived(isDark ? darkTheme : lightTheme);
<\/script>

<CommandPalette
  commands={actions}
  inputStyle={theme.inputStyle}
  paletteWrapperInnerStyle={theme.paletteWrapperInnerStyle}
  resultContainerStyle={theme.resultContainerStyle}
  optionSelectedStyle={theme.optionSelectedStyle}
/>`;

	const unstyledExample = `<!-- Remove all default styles for full control -->
<CommandPalette
  commands={actions}
  unstyled={true}
  
  <!-- Now add your own classes -->
  overlayClass="fixed inset-0 bg-black/50 z-50"
  paletteWrapperInnerClass="max-w-xl mx-auto mt-20 bg-white rounded-xl shadow-2xl"
  inputClass="w-full px-4 py-3 text-lg border-b outline-none"
  resultsContainerClass="max-h-80 overflow-y-auto"
  resultContainerClass="px-4 py-3 cursor-pointer"
  optionSelectedClass="bg-blue-50"
/>`;

	const customCssExample = `/* Override default styles with CSS */
:global(.cp-overlay) {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(12px);
}

:global(.cp-container) {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

:global(.cp-input) {
  background: transparent;
  color: white;
  font-size: 18px;
}

:global(.cp-result) {
  border-radius: 8px;
  transition: all 0.15s ease;
}

:global(.cp-result-active) {
  background: rgba(99, 102, 241, 0.2);
  transform: translateX(4px);
}`;

	$$renderer.push(`<h1>Styling</h1> <p class="lead svelte-1hdbpu7">Customize every aspect of the command palette's appearance using CSS classes, 
	inline styles, or by going completely unstyled.</p> <h2>Three Approaches</h2> <div class="approach-grid svelte-1hdbpu7"><div class="approach-card svelte-1hdbpu7"><div class="approach-icon svelte-1hdbpu7">🎨</div> <h3 class="svelte-1hdbpu7">CSS Classes</h3> <p class="svelte-1hdbpu7">Use Tailwind, CSS modules, or any class-based styling. Best for design systems.</p></div> <div class="approach-card svelte-1hdbpu7"><div class="approach-icon svelte-1hdbpu7">✨</div> <h3 class="svelte-1hdbpu7">Inline Styles</h3> <p class="svelte-1hdbpu7">Pass CSS properties directly. Great for dynamic theming based on state.</p></div> <div class="approach-card svelte-1hdbpu7"><div class="approach-icon svelte-1hdbpu7">🔧</div> <h3 class="svelte-1hdbpu7">Unstyled Mode</h3> <p class="svelte-1hdbpu7">Remove all defaults and build from scratch. Full control for custom designs.</p></div></div> <h2>Using Classes &amp; Inline Styles</h2> <p>Mix and match classes and styles to achieve the look you want:</p> <div class="code-block"><div class="code-block-header"><div class="dots"><span class="dot"></span> <span class="dot"></span> <span class="dot"></span></div> <span>Basic Styling</span></div> <pre><code>&lt;CommandPalette
  commands={actions}
  
  &lt;!-- Use CSS classes (works with Tailwind!) -->
  inputClass="rounded-lg border-gray-200 focus:ring-2"
  resultContainerClass="hover:bg-gray-50"
  optionSelectedClass="bg-blue-50 border-l-2 border-blue-500"
  
  &lt;!-- Or inline styles (CSS Properties) -->
  inputStyle={{ fontSize: '16px', padding: '1rem' }}
  overlayStyle={{ backdropFilter: 'blur(8px)' }}
/></code></pre></div> <h2>Dark Mode / Theming</h2> <p>Create theme objects and switch between them dynamically:</p> <div class="code-block"><div class="code-block-header"><div class="dots"><span class="dot"></span> <span class="dot"></span> <span class="dot"></span></div> <span>Dynamic Theming</span></div> <pre><code>&lt;script>
  let isDark = $state(false);
  
  const darkTheme = {
    inputStyle: { background: '#1f2937', color: '#f9fafb' },
    paletteWrapperInnerStyle: { 
      background: '#1f2937',
      boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
    },
    resultContainerStyle: { borderColor: '#374151' },
    optionSelectedStyle: { background: '#374151' }
  };
  
  const lightTheme = {
    inputStyle: { background: '#ffffff', color: '#111827' },
    paletteWrapperInnerStyle: { background: '#ffffff' },
    resultContainerStyle: { borderColor: '#e5e7eb' },
    optionSelectedStyle: { background: '#f3f4f6' }
  };
  
  const theme = $derived(isDark ? darkTheme : lightTheme);
&lt;/script>

&lt;CommandPalette
  commands={actions}
  inputStyle={theme.inputStyle}
  paletteWrapperInnerStyle={theme.paletteWrapperInnerStyle}
  resultContainerStyle={theme.resultContainerStyle}
  optionSelectedStyle={theme.optionSelectedStyle}
/></code></pre></div> <h2>Going Unstyled</h2> <p>Set <code>unstyled={true}</code> to remove all default styles:</p> <div class="code-block"><div class="code-block-header"><div class="dots"><span class="dot"></span> <span class="dot"></span> <span class="dot"></span></div> <span>Unstyled Mode</span></div> <pre><code>&lt;!-- Remove all default styles for full control -->
&lt;CommandPalette
  commands={actions}
  unstyled={true}
  
  &lt;!-- Now add your own classes -->
  overlayClass="fixed inset-0 bg-black/50 z-50"
  paletteWrapperInnerClass="max-w-xl mx-auto mt-20 bg-white rounded-xl shadow-2xl"
  inputClass="w-full px-4 py-3 text-lg border-b outline-none"
  resultsContainerClass="max-h-80 overflow-y-auto"
  resultContainerClass="px-4 py-3 cursor-pointer"
  optionSelectedClass="bg-blue-50"
/></code></pre></div> <div class="callout warning svelte-1hdbpu7"><div class="callout-icon svelte-1hdbpu7">⚠️</div> <div class="callout-content svelte-1hdbpu7"><strong class="svelte-1hdbpu7">Important:</strong> When using <code>unstyled</code>, you're responsible for all 
		positioning, scrolling, and visual feedback. Make sure to handle the overlay, container 
		dimensions, and scroll behavior.</div></div> <h2>CSS Class Reference</h2> <p>When not using <code>unstyled</code> mode, these classes are applied:</p> <div class="table-wrapper svelte-1hdbpu7"><table><thead><tr><th>Class</th><th>Element</th></tr></thead><tbody><tr><td><code>.cp-overlay</code></td><td>Fullscreen backdrop</td></tr><tr><td><code>.cp-wrapper</code></td><td>Centered wrapper</td></tr><tr><td><code>.cp-container</code></td><td>Main palette box</td></tr><tr><td><code>.cp-input-wrapper</code></td><td>Input container</td></tr><tr><td><code>.cp-input</code></td><td>Search input</td></tr><tr><td><code>.cp-search-icon</code></td><td>Search icon</td></tr><tr><td><code>.cp-results</code></td><td>Results list</td></tr><tr><td><code>.cp-group-header</code></td><td>Group name header</td></tr><tr><td><code>.cp-result</code></td><td>Individual result</td></tr><tr><td><code>.cp-result-active</code></td><td>Active result</td></tr><tr><td><code>.cp-result-icon</code></td><td>Result icon container</td></tr><tr><td><code>.cp-result-title</code></td><td>Result title</td></tr><tr><td><code>.cp-result-subtitle</code></td><td>Result subtitle</td></tr><tr><td><code>.cp-kbd</code></td><td>Keyboard shortcut badge</td></tr><tr><td><code>.cp-empty</code></td><td>Empty state container</td></tr></tbody></table></div> <h2>Custom CSS Overrides</h2> <p>Override default styles using global CSS:</p> <div class="code-block"><div class="code-block-header"><div class="dots"><span class="dot"></span> <span class="dot"></span> <span class="dot"></span></div> <span>Custom Overrides</span></div> <pre><code>/* Override default styles with CSS */
:global(.cp-overlay) {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(12px);
}

:global(.cp-container) {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

:global(.cp-input) {
  background: transparent;
  color: white;
  font-size: 18px;
}

:global(.cp-result) {
  border-radius: 8px;
  transition: all 0.15s ease;
}

:global(.cp-result-active) {
  background: rgba(99, 102, 241, 0.2);
  transform: translateX(4px);
}</code></pre></div>`);
}