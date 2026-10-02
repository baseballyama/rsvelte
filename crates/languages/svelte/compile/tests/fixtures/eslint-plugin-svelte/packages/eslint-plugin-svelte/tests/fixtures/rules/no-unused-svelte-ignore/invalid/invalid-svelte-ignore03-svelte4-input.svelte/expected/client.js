import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<label tabindex="0">Click</label> <ul tabindex="0"></ul>`, 1);
var root_1 = $.from_html(`<div><!></div> <div><!></div>`, 1);

export default function Invalid_svelte_ignore03_svelte4_input($$anchor) {
	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	$.await(
		node,
		() => Promise.resolve(42),
		($$anchor) => {},
		($$anchor, name) => {
			var fragment_1 = root();

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		($$anchor, name) => {
			var fragment_2 = root();

			$.next(2);
			$.append($$anchor, fragment_2);
		}
	);

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_1 = $.child(div_1);

	$.await(node_1, () => Promise.resolve(42), ($$anchor) => {}, ($$anchor, name) => {
		var fragment_3 = root();

		$.next(2);
		$.append($$anchor, fragment_3);
	});

	$.reset(div_1);
	$.append($$anchor, fragment);
}