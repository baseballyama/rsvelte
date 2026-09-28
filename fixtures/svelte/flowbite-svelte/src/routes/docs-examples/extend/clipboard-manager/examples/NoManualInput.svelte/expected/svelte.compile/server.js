import * as $ from 'svelte/internal/server';
import { ClipboardManager } from "flowbite-svelte";

export default function NoManualInput($$renderer) {
	$$renderer.push(`<div id="no-manual-input" class="lesson-content"><h2>JavaScript Variables</h2> <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p></div> `);

	ClipboardManager($$renderer, {
		enableSelectionMenu: true,
		selectionTarget: '#no-manual-input',
		showInput: false,
		storageKey: 'no-manual-input'
	});

	$$renderer.push(`<!---->`);
}