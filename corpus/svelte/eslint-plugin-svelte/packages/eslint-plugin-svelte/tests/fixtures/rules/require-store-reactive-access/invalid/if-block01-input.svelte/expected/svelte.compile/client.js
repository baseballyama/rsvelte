import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

var root = $.from_html(`<div></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function If_block01_input($$anchor, $$props) {
	$.push($$props, true);

	let store = writable('hello');
	const constStore = writable('hello');
	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			let classes;

			$.template_effect(() => classes = $.set_class(div, 1, '', null, classes, { foo: store }));
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (store) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_1 = root();
			let classes_1;

			$.template_effect(() => classes_1 = $.set_class(div_1, 1, '', null, classes_1, { foo: constStore }));
			$.append($$anchor, div_1);
		};

		$.if(node_1, ($$render) => {
			if (constStore) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}