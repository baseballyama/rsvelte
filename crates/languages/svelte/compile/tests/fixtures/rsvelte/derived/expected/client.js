import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Derived($$anchor) {
	let count = $.state(1);
	let double = $.derived(() => $.get(count) * 2);
	function increment() {
		$.set(count, $.get(count) + 1);
	}
	var button = root();
	var text = $.only_child(button);
	$.template_effect(() => $.set_text(text, `${$.get(count) ?? ''} * 2 = ${$.get(double) ?? ''}`));
	$.delegated('click', button, increment);
	$.append($$anchor, button);
}

$.delegate(['click']);
