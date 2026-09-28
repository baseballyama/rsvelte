import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div> </div> <div> </div>`, 1);

export default function Main($$anchor) {
	const hoge = {};
	const { foo: { bar } = {} } = hoge;
	const hoge2 = {};
	const { foo2: { bar2 } = { bar2: "bar2" } } = hoge2;
	var fragment = root();
	var div = $.first_child(fragment);
	var text = $.only_child(div);
	var div_1 = $.sibling(div, 2);
	var text_1 = $.only_child(div_1);

	$.template_effect(() => {
		$.set_text(text, `hello ${bar ?? ''}`);
		$.set_text(text_1, `hello ${bar2 ?? ''}`);
	});

	$.append($$anchor, fragment);
}