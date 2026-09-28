import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Main($$anchor) {
	let value = $.derived(() => false);
	let result = 'correct';

	label: if ($.get(value)) result = 'wrong';

	var p = root();
	var text = $.only_child(p, true);

	$.template_effect(() => $.set_text(text, result));
	$.append($$anchor, p);
}