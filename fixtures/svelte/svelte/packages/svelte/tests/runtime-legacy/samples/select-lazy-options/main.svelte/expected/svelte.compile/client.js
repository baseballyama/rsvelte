import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<option> </option>`);
var root_1 = $.from_html(`<select></select> <select></select> <button>Load options</button>`, 1);

export default function Main($$anchor) {
	let value = 'bar';
	let value_bound = 'bar';
	let options = {};

	function loadOptions() {
		options = { foo: 'Foo', bar: 'Bar', baz: 'Baz' };
	}

	var fragment = root_1();
	var select = $.first_child(fragment);

	$.each(select, 21, () => Object.entries(options), ([key, value]) => key, ($$anchor, $$item, $$index, $$array) => {
		var $$array_1 = $.derived(() => $.to_array($.get($$item), 2));
		let key = () => $.get($$array_1)[0];
		let value = () => $.get($$array_1)[1];
		var option = root();
		var text = $.only_child(option, true);
		var option_value = {};

		$.template_effect(() => {
			$.set_text(text, value());

			if (option_value !== (option_value = key())) {
				option.value = (option.__value = option_value) ?? '';
			}
		});

		$.append($$anchor, option);
	});

	$.reset(select);

	(
		select.value = select.__value = value,
		$.select_option(select, value)
	);

	$.init_select(select);

	var select_1 = $.sibling(select, 2);

	$.each(select_1, 21, () => Object.entries(options), ([key, value]) => key, ($$anchor, $$item, $$index_1, $$array_2) => {
		var $$array_3 = $.derived(() => $.to_array($.get($$item), 2));
		let key = () => $.get($$array_3)[0];
		let value = () => $.get($$array_3)[1];
		var option_1 = root();
		var text_1 = $.only_child(option_1, true);
		var option_1_value = {};

		$.template_effect(() => {
			$.set_text(text_1, value());

			if (option_1_value !== (option_1_value = key())) {
				option_1.value = (option_1.__value = option_1_value) ?? '';
			}
		});

		$.append($$anchor, option_1);
	});

	$.reset(select_1);
	$.init_select(select_1);

	var button = $.sibling(select_1, 2);

	$.bind_select_value(select_1, () => value_bound, ($$value) => value_bound = $$value);
	$.event('click', button, loadOptions);
	$.append($$anchor, fragment);
}