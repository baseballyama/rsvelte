import * as $ from 'svelte/internal/server';
import { ClipboardManager } from "flowbite-svelte";

export default function SaveToStorage($$renderer) {
	$$renderer.push(`<div class="persist-layout"><div id="persist-ex" class="persist-layout"><h2>JavaScript Variables</h2> <p>Select important concepts to remember:</p> <ul><li>let creates block-scoped variables</li> <li>const creates read-only references</li> <li>var creates function-scoped variables</li></ul></div> <div class="notes-panel"><h3>My Notes</h3> `);

	ClipboardManager($$renderer, {
		enableSelectionMenu: true,
		selectionTarget: '#persist-ex',
		placeholder: 'Add your own notes...',
		saveToStorage: false,
		storageKey: 'persist-ex'
	});

	$$renderer.push(`<!----></div></div>`);
}