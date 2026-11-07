import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div> </div>`);

export default function Main($$anchor) {
	let value = $.derived(() => {
		const value = 0;

		return value;
	});

	var div = root();
	var text = $.only_child(div, true);

	$.template_effect(() => $.set_text(text, $.get(value)));
	$.append($$anchor, div);
}