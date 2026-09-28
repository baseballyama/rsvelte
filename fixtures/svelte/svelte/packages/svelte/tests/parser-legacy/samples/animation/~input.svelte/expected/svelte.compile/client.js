import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>flips</div>`);

export default function Input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 24, () => things, (thing) => thing, ($$anchor, thing) => {
		var div = root();

		$.animation(div, () => flip, null);
		$.append($$anchor, div);
	});

	$.append($$anchor, fragment);
}