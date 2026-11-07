import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input type="text"/> <input type="text"/> <input type="text"/> <input/> <img/> <img/> <img/> <img/>`, 1);

export default function Test01_output($$anchor) {
	let text = '';
	let value = '';
	let src = 'tutorial/image.gif';
	let name = 'Rick Astley';
	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);

	var input_1 = $.sibling(input, 2);

	$.remove_input_defaults(input_1);

	var input_2 = $.sibling(input_1, 2);

	$.remove_input_defaults(input_2);

	var input_3 = $.sibling(input_2, 2);
	let styles;
	var img = $.sibling(input_3, 2);

	$.set_attribute(img, 'src', src);
	$.set_attribute(img, 'alt', 'Rick Astley dances.');

	var img_1 = $.sibling(img, 2);

	$.set_attribute(img_1, 'src', src);
	$.set_attribute(img_1, 'alt', 'Rick Astley dances.');

	var img_2 = $.sibling(img_1, 2);

	$.set_attribute(img_2, 'src', src);
	$.set_attribute(img_2, 'alt', 'Rick Astley dances.');

	var img_3 = $.sibling(img_2, 2);

	$.set_attribute(img_3, 'src', src === "foo" ? "a" : "b");
	$.set_attribute(img_3, 'alt', 'Rick Astley dances.');
	$.template_effect(() => styles = $.set_style(input_3, '', styles, { color: value }));
	$.bind_value(input, () => text, ($$value) => text = $$value);
	$.bind_value(input_1, () => value, ($$value) => value = $$value);
	$.bind_value(input_2, () => value, ($$value) => value = $$value);
	$.append($$anchor, fragment);
}