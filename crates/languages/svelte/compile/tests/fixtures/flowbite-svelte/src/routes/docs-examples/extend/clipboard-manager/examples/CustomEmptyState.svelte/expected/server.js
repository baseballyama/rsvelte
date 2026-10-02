import * as $ from 'svelte/internal/server';
import { ClipboardManager } from "flowbite-svelte";

export default function CustomEmptyState($$renderer) {
	$$renderer.push(`<div id="custom-empty-state"><h2>JavaScript Variables</h2> <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus iste, quis fugit quo sint quasi quam architecto ipsum, ab reprehenderit error eveniet sunt neque atque vero nulla, labore
    magnam mollitia.</p></div> `);

	{
		function emptyState($$renderer) {
			$$renderer.push(`<div class="py-12 text-center"><div class="mb-4 text-6xl">👆</div> <h3 class="mb-2 text-lg font-semibold">No saved items yet</h3> <p class="text-sm text-gray-600">Highlight any text in the article above <br/> and click "Save to Clipboard" to get started</p></div>`);
		}

		ClipboardManager($$renderer, {
			enableSelectionMenu: true,
			selectionTarget: '#custom-empty-state',
			storageKey: 'custom-empty',
			emptyState,
			$$slots: { emptyState: true }
		});
	}

	$$renderer.push(`<!---->`);
}