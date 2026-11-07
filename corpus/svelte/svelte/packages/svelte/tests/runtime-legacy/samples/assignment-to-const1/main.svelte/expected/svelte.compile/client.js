import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Main($$anchor) {
	const arr = [1, 2];

	[arr[0], arr[1]] = [arr[1], arr[0]];

	var p = root();
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `${arr[0] ?? ''}, ${arr[1] ?? ''}`));
	$.append($$anchor, p);
}