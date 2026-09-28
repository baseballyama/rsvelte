import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>increment</button> <p> </p> <p> </p> <p> </p>`, 1);

export default function Main($$anchor) {
	let count = $.state(0),
		doubled = $.derived(() => $.get(count) * 2);

	let quadrupled = $.derived(() => $.get(doubled) * 2);
	var fragment = root();
	var button = $.first_child(fragment);
	var p = $.sibling(button, 2);
	var text = $.only_child(p);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1);
	var p_2 = $.sibling(p_1, 2);
	var text_2 = $.only_child(p_2);

	$.template_effect(() => {
		$.set_text(text, `count: ${$.get(count) ?? ''}`);
		$.set_text(text_1, `doubled: ${$.get(doubled) ?? ''}`);
		$.set_text(text_2, `quadrupled: ${$.get(quadrupled) ?? ''}`);
	});

	$.delegated('click', button, () => $.set(count, $.get(count) + 1));
	$.append($$anchor, fragment);
}

$.delegate(['click']);