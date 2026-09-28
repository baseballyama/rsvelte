import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>foo</button> <button>bar</button> <p> </p>`, 1);

export default function Main($$anchor) {
	let x = 0;
	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var p = $.sibling(button_1, 2);
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `x: ${x ?? ''}`));
	$.event('click', button, () => ({ x } = { x: 1 }));
	$.event('click', button_1, () => [x] = [2]);
	$.append($$anchor, fragment);
}