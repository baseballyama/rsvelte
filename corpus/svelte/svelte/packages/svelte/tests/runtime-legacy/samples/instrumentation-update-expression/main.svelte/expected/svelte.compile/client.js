import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p> <button>foo++</button> <button>++foo</button> <p> </p> <button>bar.bar++</button> <button>++bar.bar</button>`, 1);

export default function Main($$anchor) {
	let foo = 0;
	let bar = { bar: 0 };
	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p, true);
	var button = $.sibling(p, 2);
	var button_1 = $.sibling(button, 2);
	var p_1 = $.sibling(button_1, 2);
	var text_1 = $.only_child(p_1, true);
	var button_2 = $.sibling(p_1, 2);
	var button_3 = $.sibling(button_2, 2);

	$.template_effect(() => {
		$.set_text(text, foo);
		$.set_text(text_1, bar.bar);
	});

	$.event('click', button, () => foo++);
	$.event('click', button_1, () => ++foo);
	$.event('click', button_2, () => bar.bar++);
	$.event('click', button_3, () => ++bar.bar);
	$.append($$anchor, fragment);
}