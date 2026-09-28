import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1> </h1>`);

export default function Main($$anchor) {
	let foo1;
	let foo2;

	for (let bar = foo1 = 0; bar < 5; bar += 1) {
		foo2 = foo1;
	}

	function a() {
		for (let bar = foo1 = 0; bar < 5; bar += 1) {
			foo2 = foo1;
		}
	}

	var h1 = root();
	var text = $.only_child(h1);

	$.template_effect(() => $.set_text(text, `${foo1 ?? ''} ${foo2 ?? ''}`));
	$.append($$anchor, h1);
}