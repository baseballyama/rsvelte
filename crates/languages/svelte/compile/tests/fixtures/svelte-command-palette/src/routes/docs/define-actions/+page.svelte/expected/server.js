import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	const basicExample = `import { defineActions } from '$lib'; // Use 'svelte-command-palette' in your project

const actions = defineActions([
  {
    title: 'Search Users',
    subTitle: 'Find users by name or email',
    description: 'Opens the user search modal',
    icon: '👥',
    group: 'Users',
    keywords: ['find', 'lookup', 'people'],
    shortcut: 'S U',
    onRun: ({ action, storeProps, storeMethods }) => {
      openUserSearch();
      storeMethods.closePalette();
    },
    canActionRun: ({ storeProps }) => {
      // Only show if user is authenticated
      return storeProps.isAuthenticated;
    }
  }
]);`;

	const conditionalExample = `const actions = defineActions([
  {
    actionId: 'admin-panel',
    title: 'Open Admin Panel',
    icon: '🔐',
    canActionRun: ({ storeProps }) => {
      // Only admins can see this action
      return storeProps.user?.role === 'admin';
    },
    onRun: () => goto('/admin')
  },
  {
    actionId: 'dependent-action',
    title: 'Run Follow-up Task',
    subTitle: 'Requires "admin-panel" to be run first',
    canActionRun: ({ storeProps }) => {
      // Check if admin-panel was executed
      return storeProps.calledActions.includes('admin-panel');
    },
    onRun: () => runFollowUp()
  }
]);`;

	const groupedExample = `const actions = defineActions([
  // Navigation group
  { title: 'Go to Dashboard', group: 'Navigation', icon: '🏠', ... },
  { title: 'Go to Settings', group: 'Navigation', icon: '⚙️', ... },
  
  // Actions group
  { title: 'Create New Project', group: 'Actions', icon: '➕', ... },
  { title: 'Export Data', group: 'Actions', icon: '📤', ... },
  
  // Ungrouped actions appear first
  { title: 'Search Everything', icon: '🔍', ... }
]);`;

	$$renderer.push(`<h1>Defining Actions</h1> <p class="lead svelte-1631d2a">Actions are the building blocks of your command palette. Each action defines what appears 
	in the palette and what happens when it's triggered.</p> <h2>Basic Structure</h2> <p>Use the <code>defineActions</code> helper to create properly typed actions:</p> <div class="code-block"><div class="code-block-header"><div class="dots"><span class="dot"></span> <span class="dot"></span> <span class="dot"></span></div> <span>actions.ts</span></div> <pre><code>import { defineActions } from '$lib'; // Use 'svelte-command-palette' in your project

const actions = defineActions([
  {
    title: 'Search Users',
    subTitle: 'Find users by name or email',
    description: 'Opens the user search modal',
    icon: '👥',
    group: 'Users',
    keywords: ['find', 'lookup', 'people'],
    shortcut: 'S U',
    onRun: ({ action, storeProps, storeMethods }) => {
      openUserSearch();
      storeMethods.closePalette();
    },
    canActionRun: ({ storeProps }) => {
      // Only show if user is authenticated
      return storeProps.isAuthenticated;
    }
  }
]);</code></pre></div> <h2>Action Properties</h2> <div class="table-wrapper svelte-1631d2a"><table><thead><tr><th>Property</th><th>Type</th><th>Required</th><th>Description</th></tr></thead><tbody><tr><td><code>title</code></td><td><code>string</code></td><td>✓</td><td>Main display text for the action</td></tr><tr><td><code>actionId</code></td><td><code>string | number</code></td><td></td><td>Unique identifier (auto-generated if not provided)</td></tr><tr><td><code>subTitle</code></td><td><code>string</code></td><td></td><td>Secondary text displayed below the title</td></tr><tr><td><code>description</code></td><td><code>string</code></td><td></td><td>Additional description text</td></tr><tr><td><code>icon</code></td><td><code>string | Snippet</code></td><td></td><td>Emoji, image URL, or Svelte snippet</td></tr><tr><td><code>group</code></td><td><code>string</code></td><td></td><td>Group name for organizing actions</td></tr><tr><td><code>keywords</code></td><td><code>string[]</code></td><td></td><td>Additional search terms</td></tr><tr><td><code>shortcut</code></td><td><code>string</code></td><td></td><td>Keyboard shortcut (e.g., "G D", "$mod+S")</td></tr><tr><td><code>onRun</code></td><td><code>function</code></td><td></td><td>Callback when action is executed</td></tr><tr><td><code>canActionRun</code></td><td><code>function</code></td><td></td><td>Conditional check before execution</td></tr></tbody></table></div> <h2>Callback Parameters</h2> <p>Both <code>onRun</code> and <code>canActionRun</code> receive an object with:</p> <div class="callback-params svelte-1631d2a"><div class="param-card svelte-1631d2a"><h4 class="svelte-1631d2a"><code>action</code></h4> <p class="svelte-1631d2a">The current action object being executed</p></div> <div class="param-card svelte-1631d2a"><h4 class="svelte-1631d2a"><code>storeProps</code></h4> <p class="svelte-1631d2a">Current state of the palette store (commands, results, calledActions, etc.)</p></div> <div class="param-card svelte-1631d2a"><h4 class="svelte-1631d2a"><code>storeMethods</code></h4> <p class="svelte-1631d2a">Methods to control the palette (openPalette, closePalette, togglePalette)</p></div></div> <h2>Conditional Actions</h2> <p>Use <code>canActionRun</code> to conditionally enable or disable actions:</p> <div class="code-block"><div class="code-block-header"><div class="dots"><span class="dot"></span> <span class="dot"></span> <span class="dot"></span></div> <span>Conditional Actions</span></div> <pre><code>const actions = defineActions([
  {
    actionId: 'admin-panel',
    title: 'Open Admin Panel',
    icon: '🔐',
    canActionRun: ({ storeProps }) => {
      // Only admins can see this action
      return storeProps.user?.role === 'admin';
    },
    onRun: () => goto('/admin')
  },
  {
    actionId: 'dependent-action',
    title: 'Run Follow-up Task',
    subTitle: 'Requires "admin-panel" to be run first',
    canActionRun: ({ storeProps }) => {
      // Check if admin-panel was executed
      return storeProps.calledActions.includes('admin-panel');
    },
    onRun: () => runFollowUp()
  }
]);</code></pre></div> <div class="callout svelte-1631d2a"><div class="callout-icon svelte-1631d2a">💡</div> <div class="callout-content svelte-1631d2a"><strong class="svelte-1631d2a">Tip:</strong> When <code>canActionRun</code> returns <code>false</code>, the action 
		still appears in search results but won't execute. You can show a message using <code>alert()</code> before returning <code>false</code>.</div></div> <h2>Grouped Actions</h2> <p>Organize related actions using the <code>group</code> property:</p> <div class="code-block"><div class="code-block-header"><div class="dots"><span class="dot"></span> <span class="dot"></span> <span class="dot"></span></div> <span>Grouped Actions</span></div> <pre><code>const actions = defineActions([
  // Navigation group
  { title: 'Go to Dashboard', group: 'Navigation', icon: '🏠', ... },
  { title: 'Go to Settings', group: 'Navigation', icon: '⚙️', ... },
  
  // Actions group
  { title: 'Create New Project', group: 'Actions', icon: '➕', ... },
  { title: 'Export Data', group: 'Actions', icon: '📤', ... },
  
  // Ungrouped actions appear first
  { title: 'Search Everything', icon: '🔍', ... }
]);</code></pre></div> <h2>Keyboard Shortcuts</h2> <p>Shortcuts use the <a href="https://github.com/jamiebuilds/tinykeys" target="_blank" rel="noopener">tinykeys</a> format:</p> <div class="shortcuts-examples svelte-1631d2a"><div class="shortcut-example svelte-1631d2a"><code class="svelte-1631d2a">"G D"</code> <span class="svelte-1631d2a">Press G, then D (sequence)</span></div> <div class="shortcut-example svelte-1631d2a"><code class="svelte-1631d2a">"$mod+S"</code> <span class="svelte-1631d2a">Cmd/Ctrl + S (modifier)</span></div> <div class="shortcut-example svelte-1631d2a"><code class="svelte-1631d2a">"Shift+Alt+P"</code> <span class="svelte-1631d2a">Multiple modifiers</span></div> <div class="shortcut-example svelte-1631d2a"><code class="svelte-1631d2a">"ArrowUp"</code> <span class="svelte-1631d2a">Special keys</span></div></div>`);
}