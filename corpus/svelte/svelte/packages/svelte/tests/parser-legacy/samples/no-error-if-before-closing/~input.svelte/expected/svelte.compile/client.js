import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/>`);
var root_1 = $.from_html(`<br/>`);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root_2();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var input = root();

			$.append($$anchor, input);
		};

		var alternate = ($$anchor) => {};

		$.if(node, ($$render) => {
			if (true) $$render(consequent); else $$render(alternate, -1);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var br = root_1();

			$.append($$anchor, br);
		};

		var alternate_1 = ($$anchor) => {};

		$.if(node_1, ($$render) => {
			if (true) $$render(consequent_1); else $$render(alternate_1, -1);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	$.await(
		node_2,
		() => true,
		($$anchor) => {
			var input_1 = root();

			$.append($$anchor, input_1);
		},
		($$anchor, f) => {}
	);

	var node_3 = $.sibling(node_2, 2);

	$.await(
		node_3,
		() => true,
		($$anchor) => {
			var br_1 = root_1();

			$.append($$anchor, br_1);
		},
		($$anchor, f) => {}
	);

	$.append($$anchor, fragment);
}