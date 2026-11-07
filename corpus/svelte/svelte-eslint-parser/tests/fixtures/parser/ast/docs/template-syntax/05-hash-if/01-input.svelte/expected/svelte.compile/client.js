import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function _1_input($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var text = $.text('...');

			$.append($$anchor, text);
		};

		$.if(node, ($$render) => {
			if (expression) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var text_1 = $.text('...');

			$.append($$anchor, text_1);
		};

		var consequent_2 = ($$anchor) => {
			var text_2 = $.text('...');

			$.append($$anchor, text_2);
		};

		$.if(node_1, ($$render) => {
			if (expression) $$render(consequent_1); else if (expression) $$render(consequent_2, 1);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent_3 = ($$anchor) => {
			var text_3 = $.text('...');

			$.append($$anchor, text_3);
		};

		var alternate = ($$anchor) => {
			var text_4 = $.text('...');

			$.append($$anchor, text_4);
		};

		$.if(node_2, ($$render) => {
			if (expression) $$render(consequent_3); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
}