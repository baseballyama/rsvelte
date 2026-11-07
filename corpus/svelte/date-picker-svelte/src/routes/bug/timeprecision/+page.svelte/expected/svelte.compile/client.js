import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DatePicker from '$lib/DatePicker.svelte';

var root = $.from_html(`<button>chhh</button> <!> `, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let value = $.state(void 0);
	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	DatePicker(node, {
		timePrecision: 'minute',
		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		}
	});

	var text = $.sibling(node);

	$.template_effect(($0) => $.set_text(text, ` ${$0 ?? ''}`), [() => $.get(value)?.toISOString()]);

	$.delegated('click', button, () => {
		$.set(value, new Date(2025, 3, 19, 11, 11, 11, 111), true);
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);