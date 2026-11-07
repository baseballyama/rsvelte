import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			div.textContent = abc;
			$.append($$anchor, div);
		};

		var consequent_1 = ($$anchor) => {};
		var alternate = ($$anchor) => {};

		$.if(node, ($$render) => {
			if (abc) $$render(consequent); else if (1) $$render(consequent_1, 1); else $$render(alternate, -1);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_2 = ($$anchor) => {
			var text = $.text('asdddddddddddddddd\n  dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd');

			$.append($$anchor, text);
		};

		var consequent_3 = ($$anchor) => {
			var text_1 = $.text('dddddd');

			$.append($$anchor, text_1);
		};

		$.if(node_1, ($$render) => {
			if (asd) $$render(consequent_2); else if (asd) $$render(consequent_3, 1);
		});
	}

	$.append($$anchor, fragment);
}