import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);
var root_1 = $.from_html(`<div class="chess-board"></div>`);

export default function _3_each_blocks_without_an_item_input($$anchor) {
	var div = root_1();

	$.each(div, 20, () => ({ length: 8 }), $.index, ($$anchor, $$item, rank) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		$.each(node, 16, () => ({ length: 8 }), $.index, ($$anchor, $$item, file) => {
			var div_1 = root();

			$.set_class(div_1, 1, '', null, {}, { black: (rank + file) % 2 === 1 });
			$.append($$anchor, div_1);
		});

		$.append($$anchor, fragment);
	});

	$.reset(div);
	$.append($$anchor, div);
}