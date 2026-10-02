import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(
	`<input/> <button>CLICK ME!</button> <div data-attr=""><div data-attr=""><div data-attr=""><input/> <button>CLICK
ME!</button></div></div> <div data-attr=""></div></div>`,
	1
);

export default function Test01_input($$anchor) {
	let text = "abc";
	const maxlength = 42;
	const attrs = { disabled: true };

	function click() {}

	var fragment = root();
	var input = $.first_child(fragment);

	$.attribute_effect(
		input,
		() => ({
			type: 'text',
			class: '\na\nb\n',
			maxlength,
			...attrs,
			readonly: true
		}),
		void 0,
		void 0,
		void 0,
		'svelte-7bm41u',
		true
	);

	var button = $.sibling(input, 2);

	$.attribute_effect(button, () => ({ type: 'button', maxlength, ...attrs }), void 0, void 0, void 0, 'svelte-7bm41u');

	var div = $.sibling(button, 2);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var input_1 = $.child(div_2);

	$.attribute_effect(
		input_1,
		() => ({
			type: 'text',
			class: '\na\nb\n',
			maxlength,
			...attrs,
			readonly: true
		}),
		void 0,
		void 0,
		void 0,
		'svelte-7bm41u',
		true
	);

	var button_1 = $.sibling(input_1, 2);

	$.attribute_effect(button_1, () => ({ type: 'button', maxlength, ...attrs }), void 0, void 0, void 0, 'svelte-7bm41u');
	$.reset(div_2);
	$.reset(div_1);
	$.next(2);
	$.reset(div);
	$.bind_value(input, () => text, ($$value) => text = $$value);
	$.event('click', button, click);
	$.bind_value(input_1, () => text, ($$value) => text = $$value);
	$.event('click', button_1, click);
	$.append($$anchor, fragment);
}