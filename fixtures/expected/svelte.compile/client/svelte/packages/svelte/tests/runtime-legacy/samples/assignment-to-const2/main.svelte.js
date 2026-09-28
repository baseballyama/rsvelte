import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Main($$anchor) {
	const a = 100;
	const arr = [{ a: 1 }, 2];

	[arr[0].a, arr[1] = a] = [arr[1]];

	var p = root();
	var text = $.only_child(p, true);

	$.template_effect(($0) => $.set_text(text, $0), [() => JSON.stringify(arr)]);
	$.append($$anchor, p);
}