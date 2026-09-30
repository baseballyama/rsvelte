import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button type="button"> </button> <p> </p>`, 1);

export default function Counter_svue($$anchor) {
	let count = $.state(0);
	const double = $.derived(() => $.get(count) * 2);

	function increment() {
		$.set(count, $.get(count) + 1);
	}

	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.only_child(button);
	var p = $.sibling(button, 2);
	var text_1 = $.only_child(p);

	$.template_effect(() => {
		button.disabled = $.get(count) > 9;
		$.set_text(text, `clicks: ${$.get(count) ?? ''}`);
		$.set_text(text_1, `double is ${$.get(double) ?? ''}`);
	});

	$.delegated('click', button, increment);
	$.append($$anchor, fragment);
}

$.delegate(['click']);