import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);
var root_1 = $.from_html(`<div>only visible when isOpen and id</div>`);
var root_2 = $.from_html(`<div>only visible when isopen and id</div>`);
var root_3 = $.from_html(`<h1>Welcome to SvelteKit</h1> <p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p> <button></button> <!> <!> <!> <!>`, 1);

export default function Plugin_issue254_input($$anchor) {
	let isOpen = false;
	let id = undefined;
	var fragment = root_3();
	var button = $.sibling($.first_child(fragment), 4);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (!isOpen) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_1 = root();

			$.append($$anchor, div_1);
		};

		$.if(node_1, ($$render) => {
			if (!isOpen && id) $$render(consequent_1);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_2 = root_1();

			$.append($$anchor, div_2);
		};

		$.if(node_2, ($$render) => {
			if (!isOpen && !!id) $$render(consequent_2);
		});
	}

	var node_3 = $.sibling(node_2, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_3 = root_2();

			$.append($$anchor, div_3);
		};

		$.if(node_3, ($$render) => {
			if (!isOpen && id !== undefined) $$render(consequent_3);
		});
	}

	$.event('click', button, () => isOpen = !isOpen);
	$.append($$anchor, fragment);
}