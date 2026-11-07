import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from '$app/navigation';
import { page } from '$app/state';
import Editor from '$doclib/Editor.svelte';
import Inspect from '$lib/Inspect.svelte';
import { getType } from '$lib/util.js';
import examples from './examples.js';

var root = $.from_html(`<option> </option>`);
var root_1 = $.from_html(`<h2>Playground</h2> <div class="container svelte-16kiw3y"><div class="flex row align-end justify-between w-max"><button>reset</button> <label>examples <select></select></label></div> <div class="playground svelte-16kiw3y"><!> <!></div></div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const exampleKeys = Object.keys(examples);

	function isValidExampleKey(str) {
		return exampleKeys.includes(str);
	}

	let urlName = $.derived(() => {
		const slug = page.params.example?.split('-').join(' ');

		if (slug && isValidExampleKey(slug)) {
			return slug;
		}

		return 'primitives';
	});

	let original = $.derived(() => examples[$.get(urlName)]);
	let demoInputValid = $.state(true);

	// svelte-ignore state_referenced_locally
	let sourceValue = $.state($.proxy($.get(original)));

	let value = $.state($.proxy({ name: 'Dinky Doodlebop', age: 42 }));
	let valueType = $.derived(() => getType($.get(value)));

	let props = $.derived(() => ({
		value: $.get(value),
		values: ['map', 'set', 'array', 'object'].includes($.get(valueType)) ? $.get(value) : undefined
	}));

	function reset() {
		$.set(sourceValue, $.get(original), true);
		onchange($.get(sourceValue));
		$.get(editor)?.editor()?.setValue($.get(original));
	}

	let error = $.state(void 0);

	function onchange(val) {
		try {
			const func = new Function(val);

			$.set(value, func(), true);
			$.set(demoInputValid, true);
			$.set(error, undefined);
		} catch(e) {
			if (e instanceof Error) {
				$.set(error, e.message, true);
			}

			$.set(demoInputValid, false);
		}
	}

	let editor = $.state(void 0);

	$.user_effect(() => {
		onchange(examples[$.get(urlName)]);
		reset();
	});

	var fragment = root_1();
	var div = $.sibling($.first_child(fragment), 2);
	var div_1 = $.child(div);
	var button = $.child(div_1);
	var label = $.sibling(button, 2);
	var select = $.sibling($.child(label));

	$.each(
		select,
		21,
		(// original = sourceValue
		// onchange(sourceValue)
		) => Object.entries(examples),
		([name]) => name,
		($$anchor, $$item) => {
			var $$array = $.derived(() => $.to_array($.get($$item), 1));
			let name = () => $.get($$array)[0];
			var option = root();
			var text = $.only_child(option, true);
			var option_value = {};

			$.template_effect(() => {
				$.set_text(text, name());

				if (option_value !== (option_value = name())) {
					option.__value = option_value;
				}
			});

			$.append($$anchor, option);
		}
	);

	$.reset(select);

	var select_value;

	$.init_select(select);
	$.reset(label);
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node = $.child(div_2);

	$.bind_this(
		Editor(node, {
			get value() {
				return $.get(sourceValue);
			},
			onchange,
			get valid() {
				return $.get(demoInputValid);
			},

			get message() {
				return $.get(error);
			}
		}),
		($$value) => $.set(editor, $$value, true),
		() => $.get(editor)
	);

	var node_1 = $.sibling(node, 2);

	Inspect(node_1, $.spread_props(() => $.get(props), { name: 'demo', expandLevel: 1, heading: 'playground' }));
	$.reset(div_2);
	$.reset(div);

	$.template_effect(() => {
		if (select_value !== (select_value = $.get(urlName))) {
			(
				select.value = (select.__value = select_value) ?? '',
				$.select_option(select, select_value)
			);
		}
	});

	$.delegated('click', button, () => reset());

	$.delegated('change', select, (e) => {
		const value = e.currentTarget.value.split(' ').join('-');

		goto(`/playground/${value}`);

		// original = sourceValue
		// onchange(sourceValue)
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click', 'change']);