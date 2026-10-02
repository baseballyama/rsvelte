import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<label tabindex="0">Click</label> <ul tabindex="0"></ul>`, 1);
var root_1 = $.from_html(`<div></div> <label tabindex="0">Click</label> <ul tabindex="0"></ul>`, 1);
var root_2 = $.from_html(`<div></div> <div></div>`, 1);

export default function Svelte_ignore06_input($$anchor) {
	var fragment = root_2();
	var div = $.first_child(fragment);

	$.each(div, 20, () => [], $.index, ($$anchor, e) => {
		var fragment_1 = root();

		$.next(2);
		$.append($$anchor, fragment_1);
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);

	$.each(
		div_1,
		20,
		() => [],
		$.index,
		($$anchor, e) => {
			$.next();

			var text = $.text('A');

			$.append($$anchor, text);
		},
		($$anchor) => {
			var fragment_2 = root_1();

			$.next(4);
			$.append($$anchor, fragment_2);
		}
	);

	$.reset(div_1);
	$.append($$anchor, fragment);
}