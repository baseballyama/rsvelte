import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<label tabindex="0">Click</label> <ul tabindex="0"></ul>`, 1);
var root_1 = $.from_html(`<div></div>`);

export default function Invalid_svelte_ignore02_svelte4_input($$anchor) {
	var div = root_1();

	$.each(
		div,
		20,
		() => [],
		$.index,
		($$anchor, e) => {
			$.next();

			var text = $.text('A');

			$.append($$anchor, text);
		},
		($$anchor) => {
			var fragment = root();

			$.next(2);
			$.append($$anchor, fragment);
		}
	);

	$.reset(div);
	$.append($$anchor, div);
}