import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>Hello</h1>`);

export default function Input($$anchor, $$props) {
	var h1 = root();

	$.event('click-outside', h1, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.event('click-outside2', h1, () => 'hi');
	$.append($$anchor, h1);
}