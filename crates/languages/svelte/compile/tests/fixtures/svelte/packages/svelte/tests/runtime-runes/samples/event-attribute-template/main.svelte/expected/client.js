import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(` <button> </button> <button> </button>`, 1);

export default function Main($$anchor) {
	let a = $.state(0);
	let b = $.state(0);

	$.next();

	var fragment = root();
	var text = $.first_child(fragment, true);

	text.nodeValue = '';

	var button = $.sibling(text);
	var text_1 = $.only_child(button, true);
	var text_2 = $.sibling(button, 1, true);

	text_2.nodeValue = '';

	var button_1 = $.sibling(text_2);
	var text_3 = $.only_child(button_1, true);

	$.template_effect(() => {
		$.set_text(text_1, $.get(a));
		$.set_text(text_3, $.get(b));
	});

	$.delegated('click', button, () => $.set(a, $.get(a) + 1));
	$.delegated('click', button_1, () => $.set(b, $.get(b) + 1));
	$.append($$anchor, fragment);
}

$.delegate(['click']);