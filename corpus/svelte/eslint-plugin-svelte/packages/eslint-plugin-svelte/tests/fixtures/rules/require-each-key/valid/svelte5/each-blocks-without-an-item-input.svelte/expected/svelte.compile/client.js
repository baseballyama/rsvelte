import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="chess-board"></div>`);

export default function Each_blocks_without_an_item_input($$anchor) {
	var div = root();

	$.each(div, 20, () => ({ length: 8 }), $.index, ($$anchor, $$item, rank) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		$.each(node, 16, () => ({ length: 8 }), $.index, ($$anchor, $$item) => {
			$.next();

			var text = $.text();

			text.nodeValue = rank;
			$.append($$anchor, text);
		});

		$.append($$anchor, fragment);
	});

	$.reset(div);
	$.append($$anchor, div);
}