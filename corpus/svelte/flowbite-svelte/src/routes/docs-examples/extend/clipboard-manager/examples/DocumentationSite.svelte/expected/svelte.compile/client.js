import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ClipboardManager } from "flowbite-svelte";

var root = $.from_html(`<div class="docs-layout"><div class="prose" id="docs-content"><h1>API Documentation</h1> <p>Select any code snippet or command to save it.</p> <code>git clone https://github.com/repo.git</code></div> <aside class="sidebar"><!></aside></div>`);

export default function DocumentationSite($$anchor) {
	let items = [
		{
			id: 1,
			text: "npm install package",
			pinned: true,
			timestamp: Date.now()
		}
	];

	var div = root();
	var aside = $.sibling($.child(div), 2);
	var node = $.child(aside);

	ClipboardManager(node, {
		get items() {
			return items;
		},
		enableSelectionMenu: true,
		selectionTarget: '#docs-content',
		placeholder: 'Or paste a command...',
		limit: 30,
		storageKey: 'documentation-site'
	});

	$.reset(aside);
	$.reset(div);
	$.append($$anchor, div);
}