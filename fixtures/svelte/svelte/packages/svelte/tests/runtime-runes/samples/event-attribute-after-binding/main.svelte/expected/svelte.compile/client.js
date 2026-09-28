import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(` <input type="checkbox"/> <input/>`, 1);

export default function Main($$anchor) {
	let checked_simple = $.state(false);
	let checked_simple_copy = $.state(false);
	let checked_rest = $.state(false);
	let checked_rest_copy = $.state(false);
	let rest = () => ({});

	$.next();

	var fragment = root();
	var text = $.first_child(fragment);
	var input = $.sibling(text);

	$.remove_input_defaults(input);

	var text_1 = $.sibling(input);
	var input_1 = $.sibling(text_1);

	var event_handler = () => {
		$.set(checked_rest_copy, $.get(checked_rest), true);
	};

	$.attribute_effect(input_1, ($0) => ({ type: 'checkbox', onchange: event_handler, ...$0 }), [() => rest()], void 0, void 0, void 0, true);

	$.template_effect(() => {
		$.set_text(text, `${$.get(checked_simple) ?? ''} ${$.get(checked_simple_copy) ?? ''} `);
		$.set_text(text_1, ` ${$.get(checked_rest) ?? ''} ${$.get(checked_rest_copy) ?? ''} `);
	});

	$.delegated('change', input, () => {
		$.set(checked_simple_copy, $.get(checked_simple), true);
	});

	$.bind_checked(input, () => $.get(checked_simple), ($$value) => $.set(checked_simple, $$value));
	$.bind_checked(input_1, () => $.get(checked_rest), ($$value) => $.set(checked_rest, $$value));
	$.append($$anchor, fragment);
}

$.delegate(['change']);