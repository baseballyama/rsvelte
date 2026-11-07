import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>hello world</h1>`);

export default function Input($$anchor) {
	var h1 = root();

	$.set_class(h1, 1, $.clsx({ [foo]: true }), 'svelte-r7ixbm');
	$.append($$anchor, h1);
}