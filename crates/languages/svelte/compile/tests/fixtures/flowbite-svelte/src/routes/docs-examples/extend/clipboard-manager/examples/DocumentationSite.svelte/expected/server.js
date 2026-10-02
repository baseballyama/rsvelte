import * as $ from 'svelte/internal/server';
import { ClipboardManager } from "flowbite-svelte";

export default function DocumentationSite($$renderer) {
	let items = [
		{
			id: 1,
			text: "npm install package",
			pinned: true,
			timestamp: Date.now()
		}
	];

	$$renderer.push(`<div class="docs-layout"><div class="prose" id="docs-content"><h1>API Documentation</h1> <p>Select any code snippet or command to save it.</p> <code>git clone https://github.com/repo.git</code></div> <aside class="sidebar">`);

	ClipboardManager($$renderer, {
		items,
		enableSelectionMenu: true,
		selectionTarget: '#docs-content',
		placeholder: 'Or paste a command...',
		limit: 30,
		storageKey: 'documentation-site'
	});

	$$renderer.push(`<!----></aside></div>`);
}