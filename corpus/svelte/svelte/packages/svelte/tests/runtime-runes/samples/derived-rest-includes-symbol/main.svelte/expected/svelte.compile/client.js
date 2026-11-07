import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Main($$anchor) {
	const symbol1 = Symbol();
	const symbol2 = Symbol();
	let a = { [symbol1]: 42 };

	Object.defineProperty(a, symbol2, { enumerable: false, value: "nope" });

	let b = $.derived(() => $.exclude_from_object(a, []));
	var p = root();
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `${symbol1 in $.get(b)} ${symbol2 in $.get(b)}`));
	$.append($$anchor, p);
}