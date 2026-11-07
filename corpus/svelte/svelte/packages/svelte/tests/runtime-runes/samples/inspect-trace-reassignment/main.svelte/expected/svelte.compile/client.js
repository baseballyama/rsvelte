import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input type="checkbox"/> <button> </button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(0);
	let checked = $.state(false);

	$.user_effect(() => {
		if ($.get(checked) && $.get(count) > 0 && $.get(count) < 3) {
			let old = $.get(count);

			// this should not show up in the logs
			$.set(count, 1000);

			$.set(count, old + 1);
		}
	});

	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);

	var button = $.sibling(input, 2);
	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, $.get(count)));
	$.bind_checked(input, () => $.get(checked), ($$value) => $.set(checked, $$value));

	$.delegated('click', button, () => {
		$.update(count);
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);