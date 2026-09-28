import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DateInput from '$lib/DateInput.svelte';

var root = $.from_html(`<!> <button>Set to 2024-10-15</button> `, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let min = $.proxy(new Date(2024, 1, 26, 17, 30));
	let value = $.state(void 0);
	var fragment = root();
	var node = $.first_child(fragment);

	DateInput(node, {
		timePrecision: 'minute',
		get min() {
			return min;
		},

		isDisabledDate: (date) => {
			return date.getDate() === 15 || date.getDate() === 16;
		},

		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		}
	});

	var button = $.sibling(node, 2);
	var text = $.sibling(button);

	$.template_effect(() => $.set_text(text, ` ${$.get(value) ?? ''}`));

	$.delegated('click', button, () => {
		$.set(value, new Date(2024, 10, 15), true);
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);