import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Input($$anchor) {
	function flip() {}

	var div = root();

	$.each(div, 28, () => [], (n) => n, ($$anchor, n) => {
		var div_1 = root();

		$.animation(div_1, () => flip, null);
		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.append($$anchor, div);
}