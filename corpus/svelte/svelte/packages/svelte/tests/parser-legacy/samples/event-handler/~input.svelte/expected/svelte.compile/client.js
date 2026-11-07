import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>hello!</p>`);
var root_1 = $.from_html(`<button>toggle</button> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if (visible) $$render(consequent);
		});
	}

	$.event('click', button, () => visible = !visible);
	$.append($$anchor, fragment);
}