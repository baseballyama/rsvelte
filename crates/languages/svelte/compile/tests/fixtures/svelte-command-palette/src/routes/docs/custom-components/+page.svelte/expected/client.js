import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Settings, Search, User, Home, FolderPlus, Download } from 'lucide-svelte';

var root = $.from_html(
	`<h1>Custom Components</h1> <p class="lead svelte-v7y62z">Extend the command palette with custom empty states, icons, and grouped actions.</p> <h2>Custom Empty State</h2> <p>Provide a custom UI when no search results are found:</p> <div class="code-block"><div class="code-block-header"><div class="dots"><span class="dot"></span> <span class="dot"></span> <span class="dot"></span></div> <span>Custom Empty State</span></div> <pre><code></code></pre></div> <h2>Action Icons</h2> <p>Add visual icons to your actions using emojis or image URLs:</p> <div class="code-block"><div class="code-block-header"><div class="dots"><span class="dot"></span> <span class="dot"></span> <span class="dot"></span></div> <span>Icon Types</span></div> <pre><code></code></pre></div> <div class="icon-types svelte-v7y62z"><div class="icon-type svelte-v7y62z"><span class="icon-demo svelte-v7y62z">🚀</span> <h4 class="svelte-v7y62z">Emoji</h4> <p class="svelte-v7y62z">Simple and universal</p></div> <div class="icon-type svelte-v7y62z"><span class="icon-demo svelte-v7y62z"><img src="https://github.githubassets.com/favicons/favicon.svg" alt="GitHub" width="24" height="24"/></span> <h4 class="svelte-v7y62z">URL</h4> <p class="svelte-v7y62z">External images</p></div> <div class="icon-type svelte-v7y62z"><span class="icon-demo svelte-v7y62z">📁</span> <h4 class="svelte-v7y62z">Local</h4> <p class="svelte-v7y62z">Static assets</p></div> <div class="icon-type svelte-v7y62z"><span class="icon-demo svelte-v7y62z"><!></span> <h4 class="svelte-v7y62z">Snippet</h4> <p class="svelte-v7y62z">Custom SVG/Components</p></div></div> <h2>Using Icon Libraries (Lucide, Heroicons, etc.)</h2> <p>For professional-looking icons, use third-party libraries like <a href="https://lucide.dev" target="_blank" rel="noopener">Lucide</a>, <a href="https://heroicons.com" target="_blank" rel="noopener">Heroicons</a>, or any Svelte icon library.
	Define your icons as Snippets and pass them to the <code>icon</code> property:</p> <div class="code-block"><div class="code-block-header"><div class="dots"><span class="dot"></span> <span class="dot"></span> <span class="dot"></span></div> <span>Using Lucide Icons</span></div> <pre><code></code></pre></div> <h3>Live Demo</h3> <p>Here's how Lucide icons look in practice:</p> <div class="icon-demo-grid svelte-v7y62z"><div class="icon-demo-item svelte-v7y62z"><span class="icon-box svelte-v7y62z"><!></span> <span class="svelte-v7y62z">Settings</span></div> <div class="icon-demo-item svelte-v7y62z"><span class="icon-box svelte-v7y62z"><!></span> <span class="svelte-v7y62z">Search</span></div> <div class="icon-demo-item svelte-v7y62z"><span class="icon-box svelte-v7y62z"><!></span> <span class="svelte-v7y62z">User</span></div> <div class="icon-demo-item svelte-v7y62z"><span class="icon-box svelte-v7y62z"><!></span> <span class="svelte-v7y62z">Home</span></div> <div class="icon-demo-item svelte-v7y62z"><span class="icon-box svelte-v7y62z"><!></span> <span class="svelte-v7y62z">FolderPlus</span></div> <div class="icon-demo-item svelte-v7y62z"><span class="icon-box svelte-v7y62z"><!></span> <span class="svelte-v7y62z">Download</span></div></div> <div class="callout callout-info svelte-v7y62z"><div class="callout-icon svelte-v7y62z">📦</div> <div class="callout-content svelte-v7y62z"><strong class="svelte-v7y62z">Install Lucide:</strong> <code class="svelte-v7y62z">npm install lucide-svelte</code></div></div> <h2>Action Groups</h2> <p>Organize related actions under group headers:</p> <div class="code-block"><div class="code-block-header"><div class="dots"><span class="dot"></span> <span class="dot"></span> <span class="dot"></span></div> <span>Grouped Actions</span></div> <pre><code></code></pre></div> <div class="callout svelte-v7y62z"><div class="callout-icon svelte-v7y62z">💡</div> <div class="callout-content svelte-v7y62z"><strong class="svelte-v7y62z">Tip:</strong> Actions without a <code class="svelte-v7y62z">group</code> property appear at the top of the list.
		Groups are displayed in the order they first appear in your actions array.</div></div>`,
	1
);

export default function _page($$anchor) {
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

	var fragment = root();
	var div = $.sibling($.first_child(fragment), 8);
	var pre = $.sibling($.child(div), 2);
	var code = $.child(pre);

	code.textContent = '<script lang="ts">\n  import CommandPalette, { defineActions } from \'$lib\';\n</script>\n\n<CommandPalette commands={actions}>\n  {#snippet emptyState()}\n    <div class="custom-empty">\n      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">\n        <circle cx="11" cy="11" r="8"/>\n        <path d="m21 21-4.3-4.3"/>\n      </svg>\n      <h3>No results found</h3>\n      <p>Try searching for something else</p>\n      <button on:click={() => console.log(\'Create new\')}>\n        Create new action\n      </button>\n    </div>\n  {/snippet}\n</CommandPalette>';
	$.reset(pre);
	$.reset(div);

	var div_1 = $.sibling(div, 6);
	var pre_1 = $.sibling($.child(div_1), 2);
	var code_1 = $.child(pre_1);

	code_1.textContent = 'const actions = defineActions([\n  // Emoji icons\n  {\n    title: \'Settings\',\n    icon: \'⚙️\',\n    onRun: () => openSettings()\n  },\n  \n  // Image URL icons\n  {\n    title: \'GitHub\',\n    icon: \'https://github.githubassets.com/favicons/favicon.svg\',\n    onRun: () => window.open(\'https://github.com\')\n  },\n  \n  // Local image icons\n  {\n    title: \'Profile\',\n    icon: \'/icons/user.svg\',\n    onRun: () => openProfile()\n  }\n]);';
	$.reset(pre_1);
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var div_3 = $.sibling($.child(div_2), 6);
	var span = $.child(div_3);
	var node = $.child(span);

	Settings(node, { size: 24 });
	$.reset(span);
	$.next(4);
	$.reset(div_3);
	$.reset(div_2);

	var div_4 = $.sibling(div_2, 6);
	var pre_2 = $.sibling($.child(div_4), 2);
	var code_2 = $.child(pre_2);

	code_2.textContent = '<script lang="ts">\n  import CommandPalette, { defineActions } from \'svelte-command-palette\';\n  import { Settings, Search, User, Home, FolderPlus, Download } from \'lucide-svelte\';\n</script>\n\n<!-- Define snippets for each icon -->\n{#snippet settingsIcon()}\n  <Settings size={20} />\n{/snippet}\n\n{#snippet searchIcon()}\n  <Search size={20} />\n{/snippet}\n\n{#snippet userIcon()}\n  <User size={20} />\n{/snippet}\n\n{#snippet homeIcon()}\n  <Home size={20} />\n{/snippet}\n\n<!-- Use snippets in your actions -->\n<script>\n  const actions = defineActions([\n    {\n      title: \'Open Settings\',\n      subTitle: \'Configure your preferences\',\n      icon: settingsIcon,\n      onRun: () => goto(\'/settings\')\n    },\n    {\n      title: \'Search Files\',\n      subTitle: \'Find files in your project\',\n      icon: searchIcon,\n      onRun: () => openSearch()\n    },\n    {\n      title: \'View Profile\',\n      subTitle: \'See your account details\',\n      icon: userIcon,\n      onRun: () => goto(\'/profile\')\n    },\n    {\n      title: \'Go Home\',\n      subTitle: \'Return to dashboard\',\n      icon: homeIcon,\n      onRun: () => goto(\'/\')\n    }\n  ]);\n</script>\n\n<CommandPalette commands={actions} />';
	$.reset(pre_2);
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 6);
	var div_6 = $.child(div_5);
	var span_1 = $.child(div_6);
	var node_1 = $.child(span_1);

	Settings(node_1, { size: 20 });
	$.reset(span_1);
	$.next(2);
	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var span_2 = $.child(div_7);
	var node_2 = $.child(span_2);

	Search(node_2, { size: 20 });
	$.reset(span_2);
	$.next(2);
	$.reset(div_7);

	var div_8 = $.sibling(div_7, 2);
	var span_3 = $.child(div_8);
	var node_3 = $.child(span_3);

	User(node_3, { size: 20 });
	$.reset(span_3);
	$.next(2);
	$.reset(div_8);

	var div_9 = $.sibling(div_8, 2);
	var span_4 = $.child(div_9);
	var node_4 = $.child(span_4);

	Home(node_4, { size: 20 });
	$.reset(span_4);
	$.next(2);
	$.reset(div_9);

	var div_10 = $.sibling(div_9, 2);
	var span_5 = $.child(div_10);
	var node_5 = $.child(span_5);

	FolderPlus(node_5, { size: 20 });
	$.reset(span_5);
	$.next(2);
	$.reset(div_10);

	var div_11 = $.sibling(div_10, 2);
	var span_6 = $.child(div_11);
	var node_6 = $.child(span_6);

	Download(node_6, { size: 20 });
	$.reset(span_6);
	$.next(2);
	$.reset(div_11);
	$.reset(div_5);

	var div_12 = $.sibling(div_5, 8);
	var pre_3 = $.sibling($.child(div_12), 2);
	var code_3 = $.child(pre_3);

	code_3.textContent = 'const actions = defineActions([\n  // Navigation group\n  {\n    title: \'Go to Dashboard\',\n    group: \'Navigation\',\n    icon: \'🏠\',\n    onRun: () => goto(\'/dashboard\')\n  },\n  {\n    title: \'Go to Settings\',\n    group: \'Navigation\', \n    icon: \'⚙️\',\n    onRun: () => goto(\'/settings\')\n  },\n  \n  // Actions group\n  {\n    title: \'Create New Project\',\n    group: \'Actions\',\n    icon: \'➕\',\n    onRun: () => createProject()\n  },\n  {\n    title: \'Export Data\',\n    group: \'Actions\',\n    icon: \'📤\',\n    onRun: () => exportData()\n  },\n  \n  // Ungrouped items appear at the top\n  {\n    title: \'Quick Search\',\n    icon: \'🔍\',\n    onRun: () => quickSearch()\n  }\n]);';
	$.reset(pre_3);
	$.reset(div_12);
	$.next(2);
	$.append($$anchor, fragment);
}