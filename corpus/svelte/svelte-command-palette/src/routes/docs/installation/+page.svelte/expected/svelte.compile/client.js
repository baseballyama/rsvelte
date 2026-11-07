import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>Installation</h1> <p class="lead svelte-t7c0hb">Get started with Svelte Command Palette in just a few minutes.</p> <h2>Requirements</h2> <ul><li>Svelte 5.0 or higher</li> <li>SvelteKit 2.0 or higher (recommended)</li> <li>Node.js 18 or higher</li></ul> <h2>Package Installation</h2> <p>Install the package using your preferred package manager:</p> <h3>npm</h3> <div class="code-block"><div class="code-block-header"><div class="dots"><span class="dot"></span> <span class="dot"></span> <span class="dot"></span></div> <span>Terminal</span></div> <pre><code></code></pre></div> <h3>yarn</h3> <div class="code-block"><div class="code-block-header"><div class="dots"><span class="dot"></span> <span class="dot"></span> <span class="dot"></span></div> <span>Terminal</span></div> <pre><code></code></pre></div> <h3>pnpm</h3> <div class="code-block"><div class="code-block-header"><div class="dots"><span class="dot"></span> <span class="dot"></span> <span class="dot"></span></div> <span>Terminal</span></div> <pre><code></code></pre></div> <h2>Dependencies</h2> <p>The package has minimal dependencies:</p> <div class="table-wrapper svelte-t7c0hb"><table><thead><tr><th>Package</th><th>Purpose</th></tr></thead><tbody><tr><td><code>fuse.js</code></td><td>Fuzzy search functionality</td></tr><tr><td><code>tinykeys</code></td><td>Keyboard shortcut handling</td></tr><tr><td><code>csstype</code></td><td>TypeScript CSS property types</td></tr></tbody></table></div> <h2>Next Steps</h2> <p>After installation, head to the <a href="/docs/quick-start">Quick Start guide</a> to set up your first command palette.</p>`, 1);

export default function _page($$anchor) {
	const npmInstall = `npm install svelte-command-palette`;
	const yarnInstall = `yarn add svelte-command-palette`;
	const pnpmInstall = `pnpm add svelte-command-palette`;
	var fragment = root();
	var div = $.sibling($.first_child(fragment), 14);
	var pre = $.sibling($.child(div), 2);
	var code = $.child(pre);

	code.textContent = 'npm install svelte-command-palette';
	$.reset(pre);
	$.reset(div);

	var div_1 = $.sibling(div, 4);
	var pre_1 = $.sibling($.child(div_1), 2);
	var code_1 = $.child(pre_1);

	code_1.textContent = 'yarn add svelte-command-palette';
	$.reset(pre_1);
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 4);
	var pre_2 = $.sibling($.child(div_2), 2);
	var code_2 = $.child(pre_2);

	code_2.textContent = 'pnpm add svelte-command-palette';
	$.reset(pre_2);
	$.reset(div_2);
	$.next(10);
	$.append($$anchor, fragment);
}