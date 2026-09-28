import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>increment</button> <p> </p> <p> </p> <p> </p>`, 1);

export default function Main($$anchor) {
	let offset = $.state(1);

	function* count(offset) {
		let i = offset;

		while (true) yield i++;
	}

	let $$d = $.derived(() => count($.get(offset))),
		$$array = $.derived(() => $.to_array($.get($$d), 3)),
		a = $.derived(() => $.get($$array)[0]),
		b = $.derived(() => $.get($$array)[1]),
		c = $.derived(() => $.get($$array)[2]);

	var fragment = root();
	var button = $.first_child(fragment);
	var p = $.sibling(button, 2);
	var text = $.only_child(p);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1);
	var p_2 = $.sibling(p_1, 2);
	var text_2 = $.only_child(p_2);

	$.template_effect(() => {
		$.set_text(text, `a: ${$.get(a) ?? ''}`);
		$.set_text(text_1, `b: ${$.get(b) ?? ''}`);
		$.set_text(text_2, `c: ${$.get(c) ?? ''}`);
	});

	$.delegated('click', button, () => $.set(offset, $.get(offset) + 1));
	$.append($$anchor, fragment);
}

$.delegate(['click']);