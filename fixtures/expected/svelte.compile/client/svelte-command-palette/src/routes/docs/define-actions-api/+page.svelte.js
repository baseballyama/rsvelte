import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(
	`<h1>defineActions API</h1> <p class="lead svelte-wz1ix7">The <code>defineActions</code> helper function creates properly typed action arrays
	for the command palette.</p> <h2>Function Signature</h2> <div class="code-block"><div class="code-block-header"><div class="dots"><span class="dot"></span> <span class="dot"></span> <span class="dot"></span></div> <span>Signature</span></div> <pre><code>function defineActions(actions: action[]): action[]</code></pre></div> <h2>Full Example</h2> <div class="code-block"><div class="code-block-header"><div class="dots"><span class="dot"></span> <span class="dot"></span> <span class="dot"></span></div> <span>Complete Action</span></div> <pre><code></code></pre></div> <h2>Type Definition</h2> <div class="code-block"><div class="code-block-header"><div class="dots"><span class="dot"></span> <span class="dot"></span> <span class="dot"></span></div> <span>TypeScript Types</span></div> <pre><code></code></pre></div> <h2>Property Reference</h2> <div class="table-wrapper svelte-wz1ix7"><table><thead><tr><th>Property</th><th>Type</th><th>Required</th><th>Description</th></tr></thead><tbody><tr><td><code>title</code></td><td><code>string</code></td><td>✓</td><td>Main display text for the action</td></tr><tr><td><code>actionId</code></td><td><code>string | number</code></td><td></td><td>Unique identifier (auto-generated if omitted)</td></tr><tr><td><code>subTitle</code></td><td><code>string</code></td><td></td><td>Secondary text below title</td></tr><tr><td><code>description</code></td><td><code>string</code></td><td></td><td>Additional descriptive text</td></tr><tr><td><code>icon</code></td><td><code>string</code></td><td></td><td>Emoji or image URL</td></tr><tr><td><code>group</code></td><td><code>string</code></td><td></td><td>Group header name</td></tr><tr><td><code>keywords</code></td><td><code>string[]</code></td><td></td><td>Additional search terms</td></tr><tr><td><code>shortcut</code></td><td><code>string</code></td><td></td><td>Keyboard shortcut (tinykeys format)</td></tr><tr><td><code>onRun</code></td><td><code>function</code></td><td></td><td>Callback when action executes</td></tr><tr><td><code>canActionRun</code></td><td><code>function</code></td><td></td><td>Conditional check before execution</td></tr></tbody></table></div> <h2>Callback Parameters</h2> <p>Both <code>onRun</code> and <code>canActionRun</code> receive:</p> <div class="table-wrapper svelte-wz1ix7"><table><thead><tr><th>Parameter</th><th>Type</th><th>Description</th></tr></thead><tbody><tr><td><code>action</code></td><td><code>action</code></td><td>The current action being executed</td></tr><tr><td><code>storeProps</code></td><td><code>storeParams</code></td><td>Current palette state (commands, results, etc.)</td></tr><tr><td><code>storeMethods</code></td><td><code>StoreMethods</code></td><td>Methods to control the palette</td></tr></tbody></table></div>`,
	1
);

export default function _page($$anchor) {
	const fullExample = `import { defineActions } from '$lib';
import type { action } from '$lib';

const actions = defineActions([
  {
    // Required
    title: 'Go to Dashboard',
    
    // Optional - Unique identifier
    actionId: 'nav-dashboard',
    
    // Optional - Secondary text
    subTitle: 'View your analytics',
    
    // Optional - Additional description  
    description: 'Opens the main dashboard with all your metrics',
    
    // Optional - Icon (emoji or image URL)
    icon: '📊',
    
    // Optional - Group header
    group: 'Navigation',
    
    // Optional - Search keywords
    keywords: ['analytics', 'metrics', 'home', 'main'],
    
    // Optional - Keyboard shortcut
    shortcut: 'G D',
    
    // Optional - Action handler
    onRun: ({ action, storeProps, storeMethods }) => {
      console.log('Executing:', action.title);
      goto('/dashboard');
    },
    
    // Optional - Conditional execution
    canActionRun: ({ action, storeProps, storeMethods }) => {
      return storeProps.isAuthenticated;
    }
  }
]);`;

	const typeDefinition = `interface action {
  title: string;
  actionId?: string | number;
  subTitle?: string;
  description?: string;
  icon?: string;
  group?: string;
  keywords?: string[];
  shortcut?: string;
  onRun?: (params: onRunParams) => void;
  canActionRun?: (params: onRunParams) => boolean;
}

interface onRunParams {
  action: action;
  storeProps: storeParams;
  storeMethods: StoreMethods;
}`;

	var fragment = root();
	var div = $.sibling($.first_child(fragment), 10);
	var pre = $.sibling($.child(div), 2);
	var code = $.child(pre);

	code.textContent = 'import { defineActions } from \'$lib\';\nimport type { action } from \'$lib\';\n\nconst actions = defineActions([\n  {\n    // Required\n    title: \'Go to Dashboard\',\n    \n    // Optional - Unique identifier\n    actionId: \'nav-dashboard\',\n    \n    // Optional - Secondary text\n    subTitle: \'View your analytics\',\n    \n    // Optional - Additional description  \n    description: \'Opens the main dashboard with all your metrics\',\n    \n    // Optional - Icon (emoji or image URL)\n    icon: \'📊\',\n    \n    // Optional - Group header\n    group: \'Navigation\',\n    \n    // Optional - Search keywords\n    keywords: [\'analytics\', \'metrics\', \'home\', \'main\'],\n    \n    // Optional - Keyboard shortcut\n    shortcut: \'G D\',\n    \n    // Optional - Action handler\n    onRun: ({ action, storeProps, storeMethods }) => {\n      console.log(\'Executing:\', action.title);\n      goto(\'/dashboard\');\n    },\n    \n    // Optional - Conditional execution\n    canActionRun: ({ action, storeProps, storeMethods }) => {\n      return storeProps.isAuthenticated;\n    }\n  }\n]);';
	$.reset(pre);
	$.reset(div);

	var div_1 = $.sibling(div, 4);
	var pre_1 = $.sibling($.child(div_1), 2);
	var code_1 = $.child(pre_1);

	code_1.textContent = 'interface action {\n  title: string;\n  actionId?: string | number;\n  subTitle?: string;\n  description?: string;\n  icon?: string;\n  group?: string;\n  keywords?: string[];\n  shortcut?: string;\n  onRun?: (params: onRunParams) => void;\n  canActionRun?: (params: onRunParams) => boolean;\n}\n\ninterface onRunParams {\n  action: action;\n  storeProps: storeParams;\n  storeMethods: StoreMethods;\n}';
	$.reset(pre_1);
	$.reset(div_1);
	$.next(10);
	$.append($$anchor, fragment);
}