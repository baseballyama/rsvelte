import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>setValues</button> <button>clearValues</button> <input type="text"/> <input/> <input type="checkbox"/> <input/>`, 1);

export default function Main($$anchor) {
	let value = $.state(void 0);
	let checked = $.state(false);

	function setValues() {
		$.set(value, 'message');
		$.set(checked, true);
	}

	function clearValues() {
		$.set(value, null);
		$.set(checked, null);
	}

	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var input = $.sibling(button_1, 2);

	$.remove_input_defaults(input);

	var input_1 = $.sibling(input, 2);

	$.attribute_effect(input_1, () => ({ type: 'text', value: $.get(value), ...{} }), void 0, void 0, void 0, void 0, true);

	var input_2 = $.sibling(input_1, 2);

	$.remove_input_defaults(input_2);

	var input_3 = $.sibling(input_2, 2);

	$.attribute_effect(input_3, () => ({ type: 'checkbox', checked: $.get(checked), ...{} }), void 0, void 0, void 0, void 0, true);

	$.template_effect(() => {
		$.set_value(input, $.get(value));
		$.set_checked(input_2, $.get(checked));
	});

	$.delegated('click', button, setValues);
	$.delegated('click', button_1, clearValues);
	$.append($$anchor, fragment);
}

$.delegate(['click']);