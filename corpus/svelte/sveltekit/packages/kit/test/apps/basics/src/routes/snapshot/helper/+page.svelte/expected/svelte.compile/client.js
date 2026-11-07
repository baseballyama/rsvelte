import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { afterNavigate, goto, snapshot } from '$app/navigation';
import { Foo } from '#lib';

var root = $.from_html(`<label>default <input data-testid="default"/></label> <label>manual <input data-testid="manual"/></label> <button>shallow</button> <button>change transport value</button> <a href="/snapshot/helper/b">b</a> <p data-testid="transport"> </p> <p data-testid="order"> </p>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let message = $.state('');
	let manual = $.state('');
	let foo = $.state($.proxy(new Foo('initial')));

	/** @type {string[]} */
	let order = $.proxy([]);

	snapshot({
		capture: () => $.get(message),
		restore: (value) => {
			$.set(message, value, true);
			order.push('restore');
		}
	});

	snapshot({
		id: 'snapshot-helper-manual',
		capture: () => $.get(manual),
		restore: (value) => $.set(manual, value, true)
	});

	snapshot({
		id: 'snapshot-helper-transport',
		capture: () => $.get(foo),
		restore: (value) => $.set(foo, value, true)
	});

	afterNavigate(() => {
		order.push('afterNavigate');
	});

	var fragment = root();
	var label = $.first_child(fragment);
	var input = $.sibling($.child(label));

	$.remove_input_defaults(input);
	$.reset(label);

	var label_1 = $.sibling(label, 2);
	var input_1 = $.sibling($.child(label_1));

	$.remove_input_defaults(input_1);
	$.reset(label_1);

	var button = $.sibling(label_1, 2);
	var button_1 = $.sibling(button, 2);
	var p = $.sibling(button_1, 4);
	var text = $.only_child(p, true);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1, true);

	$.template_effect(
		($0, $1) => {
			$.set_text(text, $0);
			$.set_text(text_1, $1);
		},
		[() => $.get(foo).bar(), () => order.join(',')]
	);

	$.bind_value(input, () => $.get(message), ($$value) => $.set(message, $$value));
	$.bind_value(input_1, () => $.get(manual), ($$value) => $.set(manual, $$value));
	$.delegated('click', button, () => void goto('', { shallow: true, state: { active: true } }));
	$.delegated('click', button_1, () => $.set(foo, new Foo('restored'), true));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);