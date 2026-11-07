import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button> <button> </button> <!> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let tag = 'button';
	let values = $.proxy({ a: 'red', b: 'red', c: 'red', d: 'red' });
	let count = 0;

	const factory = (name) => {
		count++;

		// check that spread effects are isolated from each other
		if (count > 8) throw new Error('too many calls');

		return {
			class: values[name],
			onclick: () => {
				values[name] = 'blue';
			}
		};
	};

	var fragment = root();
	var button = $.first_child(fragment);

	$.attribute_effect(button, ($0) => ({ ...$0 }), [() => factory('a')]);

	var text = $.only_child(button, true);
	var button_1 = $.sibling(button, 2);

	$.attribute_effect(button_1, ($0) => ({ ...$0 }), [() => factory('b')]);

	var text_1 = $.only_child(button_1, true);
	var node = $.sibling(button_1, 2);

	$.element(node, () => tag, false, ($$element, $$anchor) => {
		$.attribute_effect($$element, ($0) => ({ ...$0 }), [() => factory('c')]);

		var text_2 = $.text();

		$.template_effect(() => $.set_text(text_2, values.c));
		$.append($$anchor, text_2);
	});

	var node_1 = $.sibling(node, 2);

	$.element(node_1, () => tag, false, ($$element_1, $$anchor) => {
		$.attribute_effect($$element_1, ($0) => ({ ...$0 }), [() => factory('d')]);

		var text_3 = $.text();

		$.template_effect(() => $.set_text(text_3, values.d));
		$.append($$anchor, text_3);
	});

	$.template_effect(() => {
		$.set_text(text, values.a);
		$.set_text(text_1, values.b);
	});

	$.append($$anchor, fragment);
	$.pop();
}