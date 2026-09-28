import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(`<div></div>`);
var root_1 = $.from_html(`<input/> <input/> <!> <!> <!> <input/> <input/> <input/> <!> <!> <!> <div></div>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let pojo = { value: 1 };
	let raw = { value: 2 };
	let reactive = $.proxy({ value: 3 });
	let value = $.state(4);

	let accessors = {
		get value() {
			return $.get(value);
		},

		set value(v) {
			$.set(value, v, true);
		}
	};

	let proxied = $.state(5);

	let proxy = new Proxy({}, {
		get(target, prop, receiver) {
			if (prop === 'value') {
				return $.get(proxied);
			}

			return Reflect.get(target, prop, receiver);
		},

		set(target, prop, value, receiver) {
			if (prop === 'value') {
				$.set(proxied, value, true);

				return true;
			}

			return Reflect.set(target, prop, value, receiver);
		}
	});

	var fragment = root_1();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);

	var input_1 = $.sibling(input, 2);

	$.remove_input_defaults(input_1);

	var node = $.sibling(input_1, 2);

	Child(node, {
		get value() {
			return pojo.value;
		},

		set value($$value) {
			pojo.value = $$value;
		}
	});

	var node_1 = $.sibling(node, 2);

	Child(node_1, {
		get value() {
			return raw.value;
		},

		set value($$value) {
			raw.value = $$value;
		}
	});

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.bind_this(div, ($$value) => pojo.value = $$value, () => pojo?.value);
			$.append($$anchor, div);
		};

		$.if(node_2, ($$render) => {
			if ($.get(value)) $$render(consequent);
		});
	}

	var input_2 = $.sibling(node_2, 2);

	$.remove_input_defaults(input_2);

	var input_3 = $.sibling(input_2, 2);

	$.remove_input_defaults(input_3);

	var input_4 = $.sibling(input_3, 2);

	$.remove_input_defaults(input_4);

	var node_3 = $.sibling(input_4, 2);

	Child(node_3, {
		get value() {
			return reactive.value;
		},

		set value($$value) {
			reactive.value = $$value;
		}
	});

	var node_4 = $.sibling(node_3, 2);

	Child(node_4, {
		get value() {
			return accessors.value;
		},

		set value($$value) {
			accessors.value = $$value;
		}
	});

	var node_5 = $.sibling(node_4, 2);

	Child(node_5, {
		get value() {
			return proxy.value;
		},

		set value($$value) {
			proxy.value = $$value;
		}
	});

	var div_1 = $.sibling(node_5, 2);

	$.bind_this(div_1, ($$value) => pojo.value = $$value, () => pojo?.value);
	$.bind_value(input, () => pojo.value, ($$value) => pojo.value = $$value);
	$.bind_value(input_1, () => raw.value, ($$value) => raw.value = $$value);
	$.bind_value(input_2, () => reactive.value, ($$value) => reactive.value = $$value);
	$.bind_value(input_3, () => accessors.value, ($$value) => accessors.value = $$value);
	$.bind_value(input_4, () => proxy.value, ($$value) => proxy.value = $$value);
	$.append($$anchor, fragment);
	$.pop();
}