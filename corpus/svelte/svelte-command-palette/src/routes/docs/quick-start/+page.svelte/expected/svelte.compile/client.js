import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>Quick Start</h1> <p class="lead svelte-1r7540z">Get a fully functional command palette running in under 5 minutes.</p> <h2>Step 1: Basic Setup</h2> <p>Import the component and define your actions:</p> <div class="code-block"><div class="code-block-header"><div class="dots"><span class="dot"></span> <span class="dot"></span> <span class="dot"></span></div> <span>+page.svelte</span></div> <pre><code></code></pre></div> <h2>Step 2: Add to Layout (Recommended)</h2> <p>For app-wide access, add CommandPalette to your root layout:</p> <div class="code-block"><div class="code-block-header"><div class="dots"><span class="dot"></span> <span class="dot"></span> <span class="dot"></span></div> <span>+layout.svelte</span></div> <pre><code></code></pre></div> <h2>Step 3: Try It Out</h2> <p>Press <kbd class="kbd">⌘</kbd> + <kbd class="kbd">K</kbd> (or <kbd class="kbd">Ctrl</kbd> + <kbd class="kbd">K</kbd> on Windows/Linux) to open the command palette!</p> <div class="next-steps svelte-1r7540z"><h2>Next Steps</h2> <div class="next-steps-grid svelte-1r7540z"><a href="/docs/define-actions" class="next-step-card svelte-1r7540z"><span class="next-step-icon svelte-1r7540z">📝</span> <h3 class="svelte-1r7540z">Define Actions</h3> <p class="svelte-1r7540z">Learn about all action properties</p></a> <a href="/docs/shortcuts" class="next-step-card svelte-1r7540z"><span class="next-step-icon svelte-1r7540z">⌨️</span> <h3 class="svelte-1r7540z">Keyboard Shortcuts</h3> <p class="svelte-1r7540z">Set up custom shortcuts</p></a> <a href="/docs/styling" class="next-step-card svelte-1r7540z"><span class="next-step-icon svelte-1r7540z">🎨</span> <h3 class="svelte-1r7540z">Styling</h3> <p class="svelte-1r7540z">Customize the appearance</p></a></div></div>`, 1);

export default function _page($$anchor) {
	const basicSetup = `<script lang="ts">
  import CommandPalette, { defineActions, createStoreMethods } from '$lib';
  // Use 'svelte-command-palette' in your project

  // Define your actions
  const actions = defineActions([
    {
      title: 'Go to Home',
      subTitle: 'Navigate to homepage',
      icon: '🏠',
      onRun: () => window.location.href = '/',
      shortcut: 'G H'
    },
    {
      title: 'Toggle Dark Mode',
      subTitle: 'Switch theme',
      icon: '🌙',
      onRun: () => document.body.classList.toggle('dark'),
      shortcut: 'T D'
    }
  ]);

  // Optional: Get store methods to control palette programmatically
  const { openPalette } = createStoreMethods();
<\/script>

<!-- Render CommandPalette at the root of your app -->
<CommandPalette
  commands={actions}
  placeholder="What do you want to do?"
/>

<!-- Optional: Button to open palette -->
<button on:click={openPalette}>
  Open Command Palette
</button>`;

	const layoutExample = `<!-- src/routes/+layout.svelte -->
<script>
  import CommandPalette, { defineActions } from '$lib';
  import '../app.css';

  const actions = defineActions([
    // Your global actions here
  ]);
<\/script>

<CommandPalette commands={actions} />
<slot />`;

	var fragment = root();
	var div = $.sibling($.first_child(fragment), 8);
	var pre = $.sibling($.child(div), 2);
	var code = $.child(pre);

	code.textContent = '<script lang="ts">\n  import CommandPalette, { defineActions, createStoreMethods } from \'$lib\';\n  // Use \'svelte-command-palette\' in your project\n\n  // Define your actions\n  const actions = defineActions([\n    {\n      title: \'Go to Home\',\n      subTitle: \'Navigate to homepage\',\n      icon: \'🏠\',\n      onRun: () => window.location.href = \'/\',\n      shortcut: \'G H\'\n    },\n    {\n      title: \'Toggle Dark Mode\',\n      subTitle: \'Switch theme\',\n      icon: \'🌙\',\n      onRun: () => document.body.classList.toggle(\'dark\'),\n      shortcut: \'T D\'\n    }\n  ]);\n\n  // Optional: Get store methods to control palette programmatically\n  const { openPalette } = createStoreMethods();\n</script>\n\n<!-- Render CommandPalette at the root of your app -->\n<CommandPalette\n  commands={actions}\n  placeholder="What do you want to do?"\n/>\n\n<!-- Optional: Button to open palette -->\n<button on:click={openPalette}>\n  Open Command Palette\n</button>';
	$.reset(pre);
	$.reset(div);

	var div_1 = $.sibling(div, 6);
	var pre_1 = $.sibling($.child(div_1), 2);
	var code_1 = $.child(pre_1);

	code_1.textContent = '<!-- src/routes/+layout.svelte -->\n<script>\n  import CommandPalette, { defineActions } from \'$lib\';\n  import \'../app.css\';\n\n  const actions = defineActions([\n    // Your global actions here\n  ]);\n</script>\n\n<CommandPalette commands={actions} />\n<slot />';
	$.reset(pre_1);
	$.reset(div_1);
	$.next(6);
	$.append($$anchor, fragment);
}