import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	const shortcutExample = `const actions = defineActions([
  {
    title: 'Save Document',
    shortcut: '$mod+S',        // Cmd+S on Mac, Ctrl+S on Windows
    onRun: () => saveDocument()
  },
  {
    title: 'Search Files',
    shortcut: '$mod+Shift+F',  // Multiple modifiers
    onRun: () => openFileSearch()
  },
  {
    title: 'Quick Actions',
    shortcut: 'G G',           // Press G twice (sequence)
    onRun: () => showQuickActions()
  },
  {
    title: 'Navigate to Dashboard',
    shortcut: 'G D',           // Press G then D
    onRun: () => goto('/dashboard')
  }
]);`;

	const customTrigger = `<CommandPalette
  commands={actions}
  shortcut="$mod+p"  // Change from Cmd+K to Cmd+P
/>`;

	$$renderer.push(`<h1>Keyboard Shortcuts</h1> <p class="lead svelte-12icydk">Svelte Command Palette uses <a href="https://github.com/jamiebuilds/tinykeys" target="_blank" rel="noopener">tinykeys</a> for keyboard shortcut handling, supporting complex key combinations and sequences.</p> <h2>Shortcut Syntax</h2> <p>Shortcuts follow the tinykeys format:</p> <div class="table-wrapper svelte-12icydk"><table><thead><tr><th>Syntax</th><th>Description</th><th>Example</th></tr></thead><tbody><tr><td><code>$mod</code></td><td>Meta on Mac, Ctrl on Windows/Linux</td><td><code>$mod+K</code></td></tr><tr><td><code>Shift</code></td><td>Shift key</td><td><code>Shift+Enter</code></td></tr><tr><td><code>Alt</code></td><td>Alt/Option key</td><td><code>Alt+S</code></td></tr><tr><td><code>Control</code></td><td>Control key (explicit)</td><td><code>Control+C</code></td></tr><tr><td><code>Meta</code></td><td>Meta key (explicit)</td><td><code>Meta+K</code></td></tr><tr><td><code>Space</code></td><td>Single space-separated keys</td><td><code>G D</code> (G then D)</td></tr></tbody></table></div> <h2>Special Keys</h2> <div class="table-wrapper svelte-12icydk"><table><thead><tr><th>Key</th><th>Syntax</th></tr></thead><tbody><tr><td>Arrow keys</td><td><code>ArrowUp</code>, <code>ArrowDown</code>, <code>ArrowLeft</code>, <code>ArrowRight</code></td></tr><tr><td>Enter</td><td><code>Enter</code></td></tr><tr><td>Escape</td><td><code>Escape</code> or <code>Esc</code></td></tr><tr><td>Tab</td><td><code>Tab</code></td></tr><tr><td>Backspace</td><td><code>Backspace</code></td></tr><tr><td>Delete</td><td><code>Delete</code></td></tr><tr><td>Space</td><td><code>Space</code></td></tr></tbody></table></div> <h2>Defining Action Shortcuts</h2> <div class="code-block"><div class="code-block-header"><div class="dots"><span class="dot"></span> <span class="dot"></span> <span class="dot"></span></div> <span>actions.ts</span></div> <pre><code>const actions = defineActions([
  {
    title: 'Save Document',
    shortcut: '$mod+S',        // Cmd+S on Mac, Ctrl+S on Windows
    onRun: () => saveDocument()
  },
  {
    title: 'Search Files',
    shortcut: '$mod+Shift+F',  // Multiple modifiers
    onRun: () => openFileSearch()
  },
  {
    title: 'Quick Actions',
    shortcut: 'G G',           // Press G twice (sequence)
    onRun: () => showQuickActions()
  },
  {
    title: 'Navigate to Dashboard',
    shortcut: 'G D',           // Press G then D
    onRun: () => goto('/dashboard')
  }
]);</code></pre></div> <h2>Custom Palette Trigger</h2> <p>Change the shortcut that opens the command palette:</p> <div class="code-block"><div class="code-block-header"><div class="dots"><span class="dot"></span> <span class="dot"></span> <span class="dot"></span></div> <span>Custom Trigger</span></div> <pre><code>&lt;CommandPalette
  commands={actions}
  shortcut="$mod+p"  // Change from Cmd+K to Cmd+P
/></code></pre></div> <h2>Built-in Shortcuts</h2> <p>These shortcuts are always active when the palette is open:</p> <div class="shortcuts-grid svelte-12icydk"><div class="shortcut-item svelte-12icydk"><div class="shortcut-keys svelte-12icydk"><kbd class="kbd">↑</kbd><kbd class="kbd">↓</kbd></div> <span class="svelte-12icydk">Navigate results</span></div> <div class="shortcut-item svelte-12icydk"><div class="shortcut-keys svelte-12icydk"><kbd class="kbd">Enter</kbd></div> <span class="svelte-12icydk">Execute action</span></div> <div class="shortcut-item svelte-12icydk"><div class="shortcut-keys svelte-12icydk"><kbd class="kbd">Esc</kbd></div> <span class="svelte-12icydk">Close palette</span></div> <div class="shortcut-item svelte-12icydk"><div class="shortcut-keys svelte-12icydk"><kbd class="kbd">Tab</kbd></div> <span class="svelte-12icydk">Cycle focus</span></div></div>`);
}