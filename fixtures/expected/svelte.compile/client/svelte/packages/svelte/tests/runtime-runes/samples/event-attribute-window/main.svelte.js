import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Main($$anchor) {
	let count = $.state(0);
	var p = root();

	$.event('click', $.window, () => $.update(count));

	var text = $.only_child(p, true);

	$.template_effect(() => $.set_text(text, $.get(count)));
	$.append($$anchor, p);
}