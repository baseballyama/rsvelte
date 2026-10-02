import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function _2_each_blocks_without_an_item_input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 16, () => expression, $.index, ($$anchor, $$item) => {
		$.next();

		var text = $.text('...');

		$.append($$anchor, text);
	});

	$.append($$anchor, fragment);
}