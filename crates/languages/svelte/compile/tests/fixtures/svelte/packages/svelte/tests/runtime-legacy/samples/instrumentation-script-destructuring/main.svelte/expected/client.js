import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>foo</button> <button>bar</button> <p> </p>`, 1);

export default function Main($$anchor) {
	let x = 0;

	function foo() {
		({ x } = { x: 1 });
	}

	function bar() {
		[x] = [2];
	}

	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var p = $.sibling(button_1, 2);
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `x: ${x ?? ''}`));
	$.event('click', button, foo);
	$.event('click', button_1, bar);
	$.append($$anchor, fragment);
}