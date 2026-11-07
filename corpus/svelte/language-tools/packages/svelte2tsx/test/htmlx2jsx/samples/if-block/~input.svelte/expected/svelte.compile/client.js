import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1></h1>`);

export default function Input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var h1 = root();

			h1.textContent = `Hello ${name ?? ''}`;
			$.append($$anchor, h1);
		};

		$.if(node, ($$render) => {
			if (name == "world") $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}