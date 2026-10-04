import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Nested_runes($$anchor) {
	let result = $.state(void 0);
	function measure() {
		let items = $.proxy([1, 2]);
		let total = $.derived(() => items.length);
		items.push(3);
		$.set(result, $.get(total), true);
	}
	var button = root();
	var text = $.only_child(button, true);
	$.template_effect(() => $.set_text(text, $.get(result)));
	$.delegated('click', button, measure);
	$.append($$anchor, button);
}

$.delegate(['click']);
