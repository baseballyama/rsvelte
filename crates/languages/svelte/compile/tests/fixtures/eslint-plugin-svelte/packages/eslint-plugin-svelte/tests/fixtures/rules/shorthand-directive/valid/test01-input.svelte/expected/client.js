import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/> <div>...</div> <div>...</div> <input/> <div>...</div> <div>...</div> <div>...</div> <div>...</div>`, 1);

export default function Test01_input($$anchor) {
	let value = 'hello!';
	let active = true;
	let color = 'red';
	let foo = 42;
	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);

	var div = $.sibling(input, 2);

	$.set_class(div, 1, '', null, {}, { active });

	var div_1 = $.sibling(div, 2);

	$.set_style(div_1, '', {}, { color });

	var input_1 = $.sibling(div_1, 2);

	$.remove_input_defaults(input_1);

	var div_2 = $.sibling(input_1, 2);
	let classes;
	var div_3 = $.sibling(div_2, 2);
	let styles;
	var div_4 = $.sibling(div_3, 2);
	let styles_1;
	var div_5 = $.sibling(div_4, 2);

	$.set_style(div_5, '', {}, { color: 'red' });

	$.template_effect(() => {
		classes = $.set_class(div_2, 1, '', null, classes, { active: foo });
		styles = $.set_style(div_3, '', styles, { color: foo });
		styles_1 = $.set_style(div_4, '', styles_1, { color: `r${foo ?? ''}` });
	});

	$.bind_value(input, () => value, ($$value) => value = $$value);
	$.bind_value(input_1, () => foo, ($$value) => foo = $$value);
	$.append($$anchor, fragment);
}