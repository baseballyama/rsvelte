import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1> </h1>`);

export default function Main($$anchor) {
	var invalid = BigInt('invalid');
	var h1 = root();
	var text = $.only_child(h1, true);

	$.template_effect(() => $.set_text(text, invalid));
	$.append($$anchor, h1);
}