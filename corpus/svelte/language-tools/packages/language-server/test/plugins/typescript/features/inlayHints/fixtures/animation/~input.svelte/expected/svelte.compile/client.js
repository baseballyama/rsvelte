import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { flip } from 'svelte/animate';

var root = $.from_html(`<div></div>`);

export default function Input($$anchor) {
	let items = [{ id: 1 }];
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 25, () => items, (item) => item.id, ($$anchor, item) => {
		var div = root();

		$.animation(div, () => flip, null);
		$.append($$anchor, div);
	});

	$.append($$anchor, fragment);
}