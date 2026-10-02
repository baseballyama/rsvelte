import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable, Writable } from 'svelte/store';

var root = $.from_html(`<div></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Ts_if_block01_input($$anchor, $$props) {
	$.push($$props, true);

	let store = null;
	const constStore = writable('hello');
	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.set_class(div, 1, '', null, {}, { foo: store });
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
			let classes;

			$.template_effect(() => classes = $.set_class(div_1, 1, '', null, classes, { foo: constStore }));
			$.append($$anchor, div_1);
		};

		$.if(node_1, ($$render) => {
			if (constStore) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}