import * as $ from 'svelte/internal/server';
import { ClipboardManager } from "flowbite-svelte";

export default function TargetSpecific($$renderer) {
	$$renderer.push(`<div id="article-content"><p>Your article content here...</p> <p>Users can select any text to save it.</p></div> `);

	ClipboardManager($$renderer, {
		enableSelectionMenu: true,
		selectionTarget: '#article-content',
		storageKey: 'specific-target'
	});

	$$renderer.push(`<!---->`);
}