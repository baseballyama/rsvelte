import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>update</button> <form><input/> <input/> <input/></form>`, 1);

export default function Main($$anchor) {
	let form_attributes = $.state($.proxy({ id: 'initial-form' }));
	let class_name = $.state('first');
	let background_color = $.state('rgb(255, 0, 0)');

	function update() {
		$.set(form_attributes, { id: 'updated-form' }, true);
		$.set(class_name, 'second');
		$.set(background_color, 'rgb(0, 0, 255)');
	}

	var fragment = root();
	var button = $.first_child(fragment);
	var form = $.sibling(button, 2);

	$.attribute_effect(form, () => ({
		...$.get(form_attributes),
		class: $.get(class_name),
		[$.STYLE]: { 'background-color': $.get(background_color) }
	}));

	var input = $.child(form);

	$.attribute_effect(input, () => ({ ...{ name: '__className' }, value: 'x' }), void 0, void 0, void 0, void 0, true);

	var input_1 = $.sibling(input, 2);

	$.attribute_effect(input_1, () => ({ ...{ name: '__style' }, value: 'y' }), void 0, void 0, void 0, void 0, true);

	var input_2 = $.sibling(input_1, 2);

	$.attribute_effect(input_2, () => ({ ...{ name: '__attributes' }, value: 'z' }), void 0, void 0, void 0, void 0, true);
	$.reset(form);
	$.delegated('click', button, update);
	$.append($$anchor, fragment);
}

$.delegate(['click']);