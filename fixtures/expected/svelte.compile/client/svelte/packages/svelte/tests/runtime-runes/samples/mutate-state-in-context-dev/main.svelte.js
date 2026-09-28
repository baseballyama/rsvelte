import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

let obj = $.proxy({});

obj.test = "hi!";

var root = $.from_html(`<h1> </h1>`);

export default function Main($$anchor) {
	var h1 = root();
	var text = $.only_child(h1);

	$.template_effect(($0) => $.set_text(text, `Values: ${$0 ?? ''}`), [() => JSON.stringify(obj)]);
	$.append($$anchor, h1);
}