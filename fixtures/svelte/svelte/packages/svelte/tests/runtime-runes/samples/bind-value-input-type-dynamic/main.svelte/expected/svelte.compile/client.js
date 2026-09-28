import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/> <input/> <p> </p> <button>change to text</button> <button>change to number</button> <button>change to range</button>`, 1);

export default function Main($$anchor) {
	let dynamic = $.state('x');
	let spread = $.state('y');
	let inputType = $.state('text');
	let props = $.derived(() => ({ type: $.get(inputType) }));
	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);

	var input_1 = $.sibling(input, 2);

	$.attribute_effect(input_1, () => ({ ...$.get(props) }), void 0, void 0, void 0, void 0, true);

	var p = $.sibling(input_1, 2);
	var text = $.only_child(p);
	var button = $.sibling(p, 2);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);

	$.template_effect(() => {
		$.set_attribute(input, 'type', $.get(inputType));
		$.set_text(text, `${$.get(dynamic) ?? ''} / ${$.get(spread) ?? ''}`);
	});

	$.bind_value(input, () => $.get(dynamic), ($$value) => $.set(dynamic, $$value));
	$.bind_value(input_1, () => $.get(spread), ($$value) => $.set(spread, $$value));
	$.delegated('click', button, () => $.set(inputType, 'text'));
	$.delegated('click', button_1, () => $.set(inputType, 'number'));
	$.delegated('click', button_2, () => $.set(inputType, 'range'));
	$.append($$anchor, fragment);
}

$.delegate(['click']);