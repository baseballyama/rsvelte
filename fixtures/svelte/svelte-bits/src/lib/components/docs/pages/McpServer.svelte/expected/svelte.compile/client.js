import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import CodeBlock from '$lib/components/docs/preview/CodeBlock.svelte';
import { SAMPLE_COMPONENTS_JSON_REGISTRIES_DOC } from '$lib/constants/cli';
import claudeIcon from '$lib/assets/icons/claude.svg';
import cursorIcon from '$lib/assets/icons/cursor.svg';
import vscodeIcon from '$lib/assets/icons/vscode.svg';

var root = $.from_html(`<li class="docs-list-item dim"> </li>`);
var root_1 = $.from_html(`<p class="docs-paragraph">Restart Claude Code, then try prompts like:</p> <ul class="docs-list"></ul> <p class="docs-paragraph dim">Tip: use <code class="prop-code">/mcp</code> in Claude Code to debug the MCP server.</p>`, 1);
var root_2 = $.from_html(`<p class="docs-paragraph">Then open Cursor Settings and enable the shadcn MCP server. Try prompts like:</p> <ul class="docs-list"></ul>`, 1);
var root_3 = $.from_html(`<p class="docs-paragraph">Then open <code class="prop-code">.vscode/mcp.json</code> and click <span class="docs-highlight">Start</span> next to the shadcn server. Try prompts like:</p> <ul class="docs-list"></ul>`, 1);

var root_4 = $.from_html(`<section class="docs-section"><h3 class="docs-category-title">MCP Server</h3> <p class="docs-paragraph"><a class="docs-link svelte-k4ycog" href="https://modelcontextprotocol.io/" target="_blank" rel="noreferrer">Model Context Protocol (MCP)</a> is an open standard that lets AI assistants securely connect to external data sources and tools.</p> <p class="docs-paragraph dim">Svelte Bits encourages the use of the <a class="docs-link svelte-k4ycog" href="https://ui.shadcn.com/docs/mcp" target="_blank" rel="noreferrer">shadcn MCP server</a> to browse, search, and install components using natural language.</p> <hr class="docs-separator"/> <h3 class="docs-category-title">Quick Start</h3> <p class="docs-paragraph">Registries are configured in your project's <code class="prop-code">components.json</code> file. Add the Svelte Bits registry (example namespace <span class="docs-highlight">@sveltebits</span>; you may
		use any namespace key you prefer):</p> <!> <p class="docs-paragraph dim">Then, from the options below, select your client and set up the shadcn MCP server.</p> <div class="installation-methods svelte-k4ycog"><button type="button" aria-label="Claude Code"><img alt="Claude Code Logo" width="40" height="40"/> <span class="installation-method-label svelte-k4ycog">Claude Code</span></button> <button type="button" aria-label="Cursor"><img alt="Cursor Logo" width="40" height="40"/> <span class="installation-method-label svelte-k4ycog">Cursor</span></button> <button type="button" aria-label="VS Code"><img alt="VS Code Logo" width="40" height="40"/> <span class="installation-method-label svelte-k4ycog">VS Code</span></button></div> <p class="docs-paragraph short svelte-k4ycog">Run this in your project:</p> <!> <!> <hr class="docs-separator"/> <h3 class="docs-category-title">Learn more</h3> <p class="docs-paragraph dim mcp-learn-more svelte-k4ycog">For more on the shadcn MCP server, including manual setup for different clients, see the
		official documentation:</p> <a class="docs-paragraph docs-link svelte-k4ycog" href="https://ui.shadcn.com/docs/mcp" target="_blank" rel="noreferrer">ui.shadcn.com/docs/mcp</a> <div class="docs-button-bar"><a class="docs-button" href="/get-started/installation"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg> Installation</a></div></section>`);

export default function McpServer($$anchor, $$props) {
	$.push($$props, true);

	let client = $.state('claude');
	const initCommand = $.derived(() => `npx shadcn@latest mcp init --client ${$.get(client)}`);

	const examplePrompts = [
		'Show me all the available backgrounds from the Svelte Bits registry',
		'Add the Aurora background from Svelte Bits to the page, make it orange',
		'Add a new section which fades in on scroll using AnimatedContent from Svelte Bits'
	];

	onMount(() => {
		window.scrollTo(0, 0);
	});

	var section = root_4();

	$.head('k4ycog', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'MCP Server - svelte-bits';
		});
	});

	var node = $.sibling($.child(section), 12);

	CodeBlock(node, {
		language: 'json',
		get code() {
			return SAMPLE_COMPONENTS_JSON_REGISTRIES_DOC;
		}
	});

	var div = $.sibling(node, 4);
	var button = $.child(div);
	let classes;
	var img = $.child(button);

	$.next(2);
	$.reset(button);

	var button_1 = $.sibling(button, 2);
	let classes_1;
	var img_1 = $.child(button_1);

	$.next(2);
	$.reset(button_1);

	var button_2 = $.sibling(button_1, 2);
	let classes_2;
	var img_2 = $.child(button_2);

	$.next(2);
	$.reset(button_2);
	$.reset(div);

	var node_1 = $.sibling(div, 4);

	CodeBlock(node_1, {
		language: 'bash',
		get code() {
			return $.get(initCommand);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent = ($$anchor) => {
			var fragment = root_1();
			var ul = $.sibling($.first_child(fragment), 2);

			$.each(ul, 20, () => examplePrompts, (prompt) => prompt, ($$anchor, prompt) => {
				var li = root();
				var text = $.only_child(li, true);

				$.template_effect(() => $.set_text(text, prompt));
				$.append($$anchor, li);
			});

			$.reset(ul);
			$.next(2);
			$.append($$anchor, fragment);
		};

		var consequent_1 = ($$anchor) => {
			var fragment_1 = root_2();
			var ul_1 = $.sibling($.first_child(fragment_1), 2);

			$.each(ul_1, 20, () => examplePrompts, (prompt) => prompt, ($$anchor, prompt) => {
				var li_1 = root();
				var text_1 = $.only_child(li_1, true);

				$.template_effect(() => $.set_text(text_1, prompt));
				$.append($$anchor, li_1);
			});

			$.reset(ul_1);
			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_2 = root_3();
			var ul_2 = $.sibling($.first_child(fragment_2), 2);

			$.each(ul_2, 20, () => examplePrompts, (prompt) => prompt, ($$anchor, prompt) => {
				var li_2 = root();
				var text_2 = $.only_child(li_2, true);

				$.template_effect(() => $.set_text(text_2, prompt));
				$.append($$anchor, li_2);
			});

			$.reset(ul_2);
			$.append($$anchor, fragment_2);
		};

		$.if(node_2, ($$render) => {
			if ($.get(client) === 'claude') $$render(consequent); else if ($.get(client) === 'cursor') $$render(consequent_1, 1); else $$render(alternate, -1);
		});
	}

	$.next(10);
	$.reset(section);

	$.template_effect(() => {
		classes = $.set_class(button, 1, 'installation-method svelte-k4ycog', null, classes, { 'method-active': $.get(client) === 'claude' });
		$.set_attribute(img, 'src', claudeIcon);
		classes_1 = $.set_class(button_1, 1, 'installation-method svelte-k4ycog', null, classes_1, { 'method-active': $.get(client) === 'cursor' });
		$.set_attribute(img_1, 'src', cursorIcon);
		classes_2 = $.set_class(button_2, 1, 'installation-method svelte-k4ycog', null, classes_2, { 'method-active': $.get(client) === 'vscode' });
		$.set_attribute(img_2, 'src', vscodeIcon);
	});

	$.delegated('click', button, () => $.set(client, 'claude'));
	$.delegated('click', button_1, () => $.set(client, 'cursor'));
	$.delegated('click', button_2, () => $.set(client, 'vscode'));
	$.append($$anchor, section);
	$.pop();
}

$.delegate(['click']);