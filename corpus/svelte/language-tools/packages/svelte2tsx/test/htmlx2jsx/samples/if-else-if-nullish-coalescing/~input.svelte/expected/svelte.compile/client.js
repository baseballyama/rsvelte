import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1></h1>`);
var root_1 = $.from_html(`<h2></h2>`);

export default function Input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var h1 = root();

			h1.textContent = `Hello ${name2 ?? ''}`;
			$.append($$anchor, h1);
		};

		var consequent_1 = ($$anchor) => {
			var h2 = root_1();

			h2.textContent = `hello ${name4 ?? ''}`;
			$.append($$anchor, h2);
		};

		$.if(node, ($$render) => {
			if ((name1 ?? "bla") == "world") $$render(consequent); else if (name3 ?? "blubb") $$render(consequent_1, 1);
		});
	}

	$.append($$anchor, fragment);
}