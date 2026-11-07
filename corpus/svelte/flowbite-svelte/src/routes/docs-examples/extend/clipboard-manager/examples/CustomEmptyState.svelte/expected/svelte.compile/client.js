import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ClipboardManager } from "flowbite-svelte";

var root = $.from_html(`<div class="py-12 text-center"><div class="mb-4 text-6xl">👆</div> <h3 class="mb-2 text-lg font-semibold">No saved items yet</h3> <p class="text-sm text-gray-600">Highlight any text in the article above <br/> and click "Save to Clipboard" to get started</p></div>`);

var root_1 = $.from_html(
	`<div id="custom-empty-state"><h2>JavaScript Variables</h2> <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus iste, quis fugit quo sint quasi quam architecto ipsum, ab reprehenderit error eveniet sunt neque atque vero nulla, labore
    magnam mollitia.</p></div> <!>`,
	1
);

export default function CustomEmptyState($$anchor) {
	var fragment = root_1();
	var node = $.sibling($.first_child(fragment), 2);

	{
		const emptyState = ($$anchor) => {
			var div = root();

			$.append($$anchor, div);
		};

		ClipboardManager(node, {
			enableSelectionMenu: true,
			selectionTarget: '#custom-empty-state',
			storageKey: 'custom-empty',
			emptyState,
			$$slots: { emptyState: true }
		});
	}

	$.append($$anchor, fragment);
}