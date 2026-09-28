import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button> <input type="checkbox"/>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(0);
	let double = $.derived(() => $.get(count) * 2);
	let checked = $.state(false);

	$.user_effect(() => {
		$.get(double);
		$.get(double) >= 4 || $.get(checked);
	});

	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.only_child(button, true);
	var input = $.sibling(button, 2);

	$.remove_input_defaults(input);
	$.template_effect(() => $.set_text(text, $.get(double)));
	$.delegated('click', button, () => $.update(count));
	$.bind_checked(input, () => $.get(checked), ($$value) => $.set(checked, $$value));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);