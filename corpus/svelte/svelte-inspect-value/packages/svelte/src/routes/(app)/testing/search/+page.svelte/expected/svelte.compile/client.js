import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inspect from '$lib/index.js';
import { generateNestedNeedle } from './haystack.js';

var root = $.from_html(`<option> </option>`);
var root_1 = $.from_html(`<button>generate</button> <input type="number" min="1"/> <!> <!> <label>name <input name="name" type="text"/></label> <label>age <input name="name" type="number"/></label> <label>cool <input type="checkbox"/></label> <label>something <select></select></label>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let value = $.state($.proxy({}));
	let maxDepth = $.state(5);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const person = $.proxy({ name: 'Bananaman', age: 36, cool: true, type: 'person' });

	let something = $.state(undefined);

	let otherStuff = $.proxy({
		bananaMan: 'name',
		undefined: 'undefined',
		emptyString: ``,
		arr: [``],
		another_arr: [],
		dingle: new Map(),
		dongle: new Map([[1, 1], [2, 2]]),
		bop: new Set(),
		bap: new Set([1, 2, 3])
	});

	const vals = {
		a: undefined,
		b: null,
		c: true,
		d: 1,
		e: Symbol('something'),
		f: 'string'
	};

	let selectedOption = $.state('a');
	var fragment = root_1();
	var button = $.first_child(fragment);
	var input = $.sibling(button, 2);

	$.remove_input_defaults(input);

	var node = $.sibling(input, 2);

	$.key(node, () => $.get(value), ($$anchor) => {
		Inspect($$anchor, {
			heading: 'find the needle in the haystack',
			name: 'haystack',
			get values() {
				return $.get(value);
			},
			expandLevel: 0,
			showPreview: false,
			showLength: false,
			showTools: true
		});
	});

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => ({ person, something: $.get(something), ...otherStuff }));

		Inspect(node_1, {
			get values() {
				return $.get($0);
			},
			expandLevel: 0,
			heading: 'person'
		});
	}

	var label = $.sibling(node_1, 2);
	var input_1 = $.sibling($.child(label));

	$.remove_input_defaults(input_1);
	$.reset(label);

	var label_1 = $.sibling(label, 2);
	var input_2 = $.sibling($.child(label_1));

	$.remove_input_defaults(input_2);
	$.reset(label_1);

	var label_2 = $.sibling(label_1, 2);
	var input_3 = $.sibling($.child(label_2));

	$.remove_input_defaults(input_3);
	$.reset(label_2);

	var label_3 = $.sibling(label_2, 2);
	var select = $.sibling($.child(label_3));

	$.each(select, 21, () => Object.entries(vals), ([key, value]) => key, ($$anchor, $$item, $$index, $$array) => {
		var $$array_1 = $.derived(() => $.to_array($.get($$item), 2));
		let key = () => $.get($$array_1)[0];
		let value = () => $.get($$array_1)[1];
		var option = root();
		var text = $.only_child(option, true);
		var option_value = {};

		$.template_effect(
			($0) => {
				$.set_text(text, $0);

				if (option_value !== (option_value = key())) {
					option.value = (option.__value = option_value) ?? '';
				}
			},
			[() => String(value())]
		);

		$.append($$anchor, option);
	});

	$.reset(select);
	$.init_select(select);
	$.reset(label_3);

	$.delegated('click', button, () => {
		$.set(value, generateNestedNeedle($.get(maxDepth)), true);
	});

	$.bind_value(input, () => $.get(maxDepth), ($$value) => $.set(maxDepth, $$value));
	$.bind_value(input_1, () => person.name, ($$value) => person.name = $$value);
	$.bind_value(input_2, () => person.age, ($$value) => person.age = $$value);
	$.bind_checked(input_3, () => person.cool, ($$value) => person.cool = $$value);
	$.delegated('change', select, () => $.set(something, vals[$.get(selectedOption)], true));
	$.bind_select_value(select, () => $.get(selectedOption), ($$value) => $.set(selectedOption, $$value));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click', 'change']);