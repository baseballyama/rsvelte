import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);
var root_1 = $.from_html(`<button></button> <!> <!>`, 1);

export default function Template01_input($$anchor) {
	let foo = false;
	let bar = undefined;
	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (!foo) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_1 = root();

			$.append($$anchor, div_1);
		};

		$.if(node_1, ($$render) => {
			if (!foo && bar) $$render(consequent_1);
		});
	}

	$.event('click', button, () => foo = !foo);
	$.append($$anchor, fragment);
}