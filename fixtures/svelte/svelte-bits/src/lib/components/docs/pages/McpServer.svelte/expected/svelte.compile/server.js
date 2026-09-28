import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import CodeBlock from '$lib/components/docs/preview/CodeBlock.svelte';
import { SAMPLE_COMPONENTS_JSON_REGISTRIES_DOC } from '$lib/constants/cli';
import claudeIcon from '$lib/assets/icons/claude.svg';
import cursorIcon from '$lib/assets/icons/cursor.svg';
import vscodeIcon from '$lib/assets/icons/vscode.svg';

export default function McpServer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let client = 'claude';
		const initCommand = $.derived(() => `npx shadcn@latest mcp init --client ${client}`);

		const examplePrompts = [
			'Show me all the available backgrounds from the Svelte Bits registry',
			'Add the Aurora background from Svelte Bits to the page, make it orange',
			'Add a new section which fades in on scroll using AnimatedContent from Svelte Bits'
		];

		onMount(() => {
			window.scrollTo(0, 0);
		});

		$.head('k4ycog', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>MCP Server - svelte-bits</title>`);
			});
		});

		$$renderer.push(`<section class="docs-section"><h3 class="docs-category-title">MCP Server</h3> <p class="docs-paragraph"><a class="docs-link svelte-k4ycog" href="https://modelcontextprotocol.io/" target="_blank" rel="noreferrer">Model Context Protocol (MCP)</a> is an open standard that lets AI assistants securely connect to external data sources and tools.</p> <p class="docs-paragraph dim">Svelte Bits encourages the use of the <a class="docs-link svelte-k4ycog" href="https://ui.shadcn.com/docs/mcp" target="_blank" rel="noreferrer">shadcn MCP server</a> to browse, search, and install components using natural language.</p> <hr class="docs-separator"/> <h3 class="docs-category-title">Quick Start</h3> <p class="docs-paragraph">Registries are configured in your project's <code class="prop-code">components.json</code> file. Add the Svelte Bits registry (example namespace <span class="docs-highlight">@sveltebits</span>; you may
		use any namespace key you prefer):</p> `);

		CodeBlock($$renderer, {
			language: 'json',
			code: SAMPLE_COMPONENTS_JSON_REGISTRIES_DOC
		});

		$$renderer.push(`<!----> <p class="docs-paragraph dim">Then, from the options below, select your client and set up the shadcn MCP server.</p> <div class="installation-methods svelte-k4ycog"><button type="button"${$.attr_class('installation-method svelte-k4ycog', void 0, { 'method-active': client === 'claude' })} aria-label="Claude Code"><img${$.attr('src', claudeIcon)} alt="Claude Code Logo" width="40" height="40"/> <span class="installation-method-label svelte-k4ycog">Claude Code</span></button> <button type="button"${$.attr_class('installation-method svelte-k4ycog', void 0, { 'method-active': client === 'cursor' })} aria-label="Cursor"><img${$.attr('src', cursorIcon)} alt="Cursor Logo" width="40" height="40"/> <span class="installation-method-label svelte-k4ycog">Cursor</span></button> <button type="button"${$.attr_class('installation-method svelte-k4ycog', void 0, { 'method-active': client === 'vscode' })} aria-label="VS Code"><img${$.attr('src', vscodeIcon)} alt="VS Code Logo" width="40" height="40"/> <span class="installation-method-label svelte-k4ycog">VS Code</span></button></div> <p class="docs-paragraph short svelte-k4ycog">Run this in your project:</p> `);
		CodeBlock($$renderer, { language: 'bash', code: initCommand() });
		$$renderer.push(`<!----> `);

		if (client === 'claude') {
			$$renderer.push(`<!--[0--><p class="docs-paragraph">Restart Claude Code, then try prompts like:</p> <ul class="docs-list"><!--[-->`);

			const each_array = $.ensure_array_like(examplePrompts);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let prompt = each_array[$$index];

				$$renderer.push(`<li class="docs-list-item dim">${$.escape(prompt)}</li>`);
			}

			$$renderer.push(`<!--]--></ul> <p class="docs-paragraph dim">Tip: use <code class="prop-code">/mcp</code> in Claude Code to debug the MCP server.</p>`);
		} else if (client === 'cursor') {
			$$renderer.push(`<!--[1--><p class="docs-paragraph">Then open Cursor Settings and enable the shadcn MCP server. Try prompts like:</p> <ul class="docs-list"><!--[-->`);

			const each_array_1 = $.ensure_array_like(examplePrompts);

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let prompt = each_array_1[$$index_1];

				$$renderer.push(`<li class="docs-list-item dim">${$.escape(prompt)}</li>`);
			}

			$$renderer.push(`<!--]--></ul>`);
		} else {
			$$renderer.push(`<!--[-1--><p class="docs-paragraph">Then open <code class="prop-code">.vscode/mcp.json</code> and click <span class="docs-highlight">Start</span> next to the shadcn server. Try prompts like:</p> <ul class="docs-list"><!--[-->`);

			const each_array_2 = $.ensure_array_like(examplePrompts);

			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let prompt = each_array_2[$$index_2];

				$$renderer.push(`<li class="docs-list-item dim">${$.escape(prompt)}</li>`);
			}

			$$renderer.push(`<!--]--></ul>`);
		}

		$$renderer.push(`<!--]--> <hr class="docs-separator"/> <h3 class="docs-category-title">Learn more</h3> <p class="docs-paragraph dim mcp-learn-more svelte-k4ycog">For more on the shadcn MCP server, including manual setup for different clients, see the
		official documentation:</p> <a class="docs-paragraph docs-link svelte-k4ycog" href="https://ui.shadcn.com/docs/mcp" target="_blank" rel="noreferrer">ui.shadcn.com/docs/mcp</a> <div class="docs-button-bar"><a class="docs-button" href="/get-started/installation"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg> Installation</a></div></section>`);
	});
}