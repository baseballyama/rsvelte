import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<label tabindex="0">Click</label> <ul tabindex="0"></ul>`, 1);
var root_1 = $.from_html(`<div><!></div> <div><!></div> <div><!></div> <div><!></div> <div><!></div>`, 1);

export default function Svelte_ignore07_input($$anchor) {
	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	$.await(node, () => Promise.resolve(42), ($$anchor) => {
		var fragment_1 = root();

		$.next(2);
		$.append($$anchor, fragment_1);
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_1 = $.child(div_1);

	$.await(
		node_1,
		() => Promise.resolve(42),
		($$anchor) => {
			var fragment_4 = root();

			$.next(2);
			$.append($$anchor, fragment_4);
		},
		($$anchor, name) => {
			var fragment_2 = root();

			$.next(2);
			$.append($$anchor, fragment_2);
		},
		($$anchor, name) => {
			var fragment_3 = root();

			$.next(2);
			$.append($$anchor, fragment_3);
		}
	);

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_2 = $.child(div_2);

	$.await(
		node_2,
		() => Promise.resolve(42),
		($$anchor) => {
			var fragment_6 = root();

			$.next(2);
			$.append($$anchor, fragment_6);
		},
		($$anchor, name) => {
			var fragment_5 = root();

			$.next(2);
			$.append($$anchor, fragment_5);
		}
	);

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_3 = $.child(div_3);

	$.await(node_3, () => Promise.resolve(42), null, ($$anchor, n) => {
		var fragment_7 = root();

		$.next(2);
		$.append($$anchor, fragment_7);
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_4 = $.child(div_4);

	$.await(node_4, () => Promise.resolve(42), null, void 0, ($$anchor, n) => {
		var fragment_8 = root();

		$.next(2);
		$.append($$anchor, fragment_8);
	});

	$.reset(div_4);
	$.append($$anchor, fragment);
}