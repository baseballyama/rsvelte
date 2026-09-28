import * as $ from 'svelte/internal/server';
import { ClipboardManager } from "flowbite-svelte";

export default function BlogReader($$renderer) {
	$$renderer.push(`<article class="mx-auto max-w-4xl"><div id="article-body" class="prose"><h1>How to Build Better UIs</h1> <p>Select any quote or insight to save for later...</p></div></article> <div class="mx-auto w-80">`);

	ClipboardManager($$renderer, {
		enableSelectionMenu: true,
		selectionTarget: '#article-body',
		saveLabel: 'Add',
		clearLabel: 'Clear All!',
		storageKey: 'blog-reader'
	});

	$$renderer.push(`<!----></div>`);
}