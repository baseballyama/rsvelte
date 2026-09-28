import * as $ from 'svelte/internal/server';
import { Settings, Search, User, Home, FolderPlus, Download } from 'lucide-svelte';

export default function _page($$renderer) {
	const emptyStateExample = `<script lang="ts">
  import CommandPalette, { defineActions } from '$lib';
<\/script>

<CommandPalette commands={actions}>
  {#snippet emptyState()}
    <div class="custom-empty">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.3-4.3"/>
      </svg>
      <h3>No results found</h3>
      <p>Try searching for something else</p>
      <button on:click={() => console.log('Create new')}>
        Create new action
      </button>
    </div>
  {/snippet}
</CommandPalette>`;

	const iconExamples = `const actions = defineActions([
  // Emoji icons
  {
    title: 'Settings',
    icon: '⚙️',
    onRun: () => openSettings()
  },
  
  // Image URL icons
  {
    title: 'GitHub',
    icon: 'https://github.githubassets.com/favicons/favicon.svg',
    onRun: () => window.open('https://github.com')
  },
  
  // Local image icons
  {
    title: 'Profile',
    icon: '/icons/user.svg',
    onRun: () => openProfile()
  }
]);`;

	const lucideExample = `<script lang="ts">
  import CommandPalette, { defineActions } from 'svelte-command-palette';
  import { Settings, Search, User, Home, FolderPlus, Download } from 'lucide-svelte';
<\/script>

<!-- Define snippets for each icon -->
{#snippet settingsIcon()}
  <Settings size={20} />
{/snippet}

{#snippet searchIcon()}
  <Search size={20} />
{/snippet}

{#snippet userIcon()}
  <User size={20} />
{/snippet}

{#snippet homeIcon()}
  <Home size={20} />
{/snippet}

<!-- Use snippets in your actions -->
<script>
  const actions = defineActions([
    {
      title: 'Open Settings',
      subTitle: 'Configure your preferences',
      icon: settingsIcon,
      onRun: () => goto('/settings')
    },
    {
      title: 'Search Files',
      subTitle: 'Find files in your project',
      icon: searchIcon,
      onRun: () => openSearch()
    },
    {
      title: 'View Profile',
      subTitle: 'See your account details',
      icon: userIcon,
      onRun: () => goto('/profile')
    },
    {
      title: 'Go Home',
      subTitle: 'Return to dashboard',
      icon: homeIcon,
      onRun: () => goto('/')
    }
  ]);
<\/script>

<CommandPalette commands={actions} />`;

	const groupExample = `const actions = defineActions([
  // Navigation group
  {
    title: 'Go to Dashboard',
    group: 'Navigation',
    icon: '🏠',
    onRun: () => goto('/dashboard')
  },
  {
    title: 'Go to Settings',
    group: 'Navigation', 
    icon: '⚙️',
    onRun: () => goto('/settings')
  },
  
  // Actions group
  {
    title: 'Create New Project',
    group: 'Actions',
    icon: '➕',
    onRun: () => createProject()
  },
  {
    title: 'Export Data',
    group: 'Actions',
    icon: '📤',
    onRun: () => exportData()
  },
  
  // Ungrouped items appear at the top
  {
    title: 'Quick Search',
    icon: '🔍',
    onRun: () => quickSearch()
  }
]);`;

	$$renderer.push(`<h1>Custom Components</h1> <p class="lead svelte-v7y62z">Extend the command palette with custom empty states, icons, and grouped actions.</p> <h2>Custom Empty State</h2> <p>Provide a custom UI when no search results are found:</p> <div class="code-block"><div class="code-block-header"><div class="dots"><span class="dot"></span> <span class="dot"></span> <span class="dot"></span></div> <span>Custom Empty State</span></div> <pre><code>&lt;script lang="ts">
  import CommandPalette, { defineActions } from '$lib';
&lt;/script>

&lt;CommandPalette commands={actions}>
  {#snippet emptyState()}
    &lt;div class="custom-empty">
      &lt;svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        &lt;circle cx="11" cy="11" r="8"/>
        &lt;path d="m21 21-4.3-4.3"/>
      &lt;/svg>
      &lt;h3>No results found&lt;/h3>
      &lt;p>Try searching for something else&lt;/p>
      &lt;button on:click={() => console.log('Create new')}>
        Create new action
      &lt;/button>
    &lt;/div>
  {/snippet}
&lt;/CommandPalette></code></pre></div> <h2>Action Icons</h2> <p>Add visual icons to your actions using emojis or image URLs:</p> <div class="code-block"><div class="code-block-header"><div class="dots"><span class="dot"></span> <span class="dot"></span> <span class="dot"></span></div> <span>Icon Types</span></div> <pre><code>const actions = defineActions([
  // Emoji icons
  {
    title: 'Settings',
    icon: '⚙️',
    onRun: () => openSettings()
  },
  
  // Image URL icons
  {
    title: 'GitHub',
    icon: 'https://github.githubassets.com/favicons/favicon.svg',
    onRun: () => window.open('https://github.com')
  },
  
  // Local image icons
  {
    title: 'Profile',
    icon: '/icons/user.svg',
    onRun: () => openProfile()
  }
]);</code></pre></div> <div class="icon-types svelte-v7y62z"><div class="icon-type svelte-v7y62z"><span class="icon-demo svelte-v7y62z">🚀</span> <h4 class="svelte-v7y62z">Emoji</h4> <p class="svelte-v7y62z">Simple and universal</p></div> <div class="icon-type svelte-v7y62z"><span class="icon-demo svelte-v7y62z"><img src="https://github.githubassets.com/favicons/favicon.svg" alt="GitHub" width="24" height="24"/></span> <h4 class="svelte-v7y62z">URL</h4> <p class="svelte-v7y62z">External images</p></div> <div class="icon-type svelte-v7y62z"><span class="icon-demo svelte-v7y62z">📁</span> <h4 class="svelte-v7y62z">Local</h4> <p class="svelte-v7y62z">Static assets</p></div> <div class="icon-type svelte-v7y62z"><span class="icon-demo svelte-v7y62z">`);

	Settings($$renderer, { size: 24 });

	$$renderer.push(`<!----></span> <h4 class="svelte-v7y62z">Snippet</h4> <p class="svelte-v7y62z">Custom SVG/Components</p></div></div> <h2>Using Icon Libraries (Lucide, Heroicons, etc.)</h2> <p>For professional-looking icons, use third-party libraries like <a href="https://lucide.dev" target="_blank" rel="noopener">Lucide</a>, <a href="https://heroicons.com" target="_blank" rel="noopener">Heroicons</a>, or any Svelte icon library.
	Define your icons as Snippets and pass them to the <code>icon</code> property:</p> <div class="code-block"><div class="code-block-header"><div class="dots"><span class="dot"></span> <span class="dot"></span> <span class="dot"></span></div> <span>Using Lucide Icons</span></div> <pre><code>&lt;script lang="ts">
  import CommandPalette, { defineActions } from 'svelte-command-palette';
  import { Settings, Search, User, Home, FolderPlus, Download } from 'lucide-svelte';
&lt;/script>

&lt;!-- Define snippets for each icon -->
{#snippet settingsIcon()}
  &lt;Settings size={20} />
{/snippet}

{#snippet searchIcon()}
  &lt;Search size={20} />
{/snippet}

{#snippet userIcon()}
  &lt;User size={20} />
{/snippet}

{#snippet homeIcon()}
  &lt;Home size={20} />
{/snippet}

&lt;!-- Use snippets in your actions -->
&lt;script>
  const actions = defineActions([
    {
      title: 'Open Settings',
      subTitle: 'Configure your preferences',
      icon: settingsIcon,
      onRun: () => goto('/settings')
    },
    {
      title: 'Search Files',
      subTitle: 'Find files in your project',
      icon: searchIcon,
      onRun: () => openSearch()
    },
    {
      title: 'View Profile',
      subTitle: 'See your account details',
      icon: userIcon,
      onRun: () => goto('/profile')
    },
    {
      title: 'Go Home',
      subTitle: 'Return to dashboard',
      icon: homeIcon,
      onRun: () => goto('/')
    }
  ]);
&lt;/script>

&lt;CommandPalette commands={actions} /></code></pre></div> <h3>Live Demo</h3> <p>Here's how Lucide icons look in practice:</p> <div class="icon-demo-grid svelte-v7y62z"><div class="icon-demo-item svelte-v7y62z"><span class="icon-box svelte-v7y62z">`);

	Settings($$renderer, { size: 20 });
	$$renderer.push(`<!----></span> <span class="svelte-v7y62z">Settings</span></div> <div class="icon-demo-item svelte-v7y62z"><span class="icon-box svelte-v7y62z">`);
	Search($$renderer, { size: 20 });
	$$renderer.push(`<!----></span> <span class="svelte-v7y62z">Search</span></div> <div class="icon-demo-item svelte-v7y62z"><span class="icon-box svelte-v7y62z">`);
	User($$renderer, { size: 20 });
	$$renderer.push(`<!----></span> <span class="svelte-v7y62z">User</span></div> <div class="icon-demo-item svelte-v7y62z"><span class="icon-box svelte-v7y62z">`);
	Home($$renderer, { size: 20 });
	$$renderer.push(`<!----></span> <span class="svelte-v7y62z">Home</span></div> <div class="icon-demo-item svelte-v7y62z"><span class="icon-box svelte-v7y62z">`);
	FolderPlus($$renderer, { size: 20 });
	$$renderer.push(`<!----></span> <span class="svelte-v7y62z">FolderPlus</span></div> <div class="icon-demo-item svelte-v7y62z"><span class="icon-box svelte-v7y62z">`);
	Download($$renderer, { size: 20 });

	$$renderer.push(`<!----></span> <span class="svelte-v7y62z">Download</span></div></div> <div class="callout callout-info svelte-v7y62z"><div class="callout-icon svelte-v7y62z">📦</div> <div class="callout-content svelte-v7y62z"><strong class="svelte-v7y62z">Install Lucide:</strong> <code class="svelte-v7y62z">npm install lucide-svelte</code></div></div> <h2>Action Groups</h2> <p>Organize related actions under group headers:</p> <div class="code-block"><div class="code-block-header"><div class="dots"><span class="dot"></span> <span class="dot"></span> <span class="dot"></span></div> <span>Grouped Actions</span></div> <pre><code>const actions = defineActions([
  // Navigation group
  {
    title: 'Go to Dashboard',
    group: 'Navigation',
    icon: '🏠',
    onRun: () => goto('/dashboard')
  },
  {
    title: 'Go to Settings',
    group: 'Navigation', 
    icon: '⚙️',
    onRun: () => goto('/settings')
  },
  
  // Actions group
  {
    title: 'Create New Project',
    group: 'Actions',
    icon: '➕',
    onRun: () => createProject()
  },
  {
    title: 'Export Data',
    group: 'Actions',
    icon: '📤',
    onRun: () => exportData()
  },
  
  // Ungrouped items appear at the top
  {
    title: 'Quick Search',
    icon: '🔍',
    onRun: () => quickSearch()
  }
]);</code></pre></div> <div class="callout svelte-v7y62z"><div class="callout-icon svelte-v7y62z">💡</div> <div class="callout-content svelte-v7y62z"><strong class="svelte-v7y62z">Tip:</strong> Actions without a <code class="svelte-v7y62z">group</code> property appear at the top of the list.
		Groups are displayed in the order they first appear in your actions array.</div></div>`);
}