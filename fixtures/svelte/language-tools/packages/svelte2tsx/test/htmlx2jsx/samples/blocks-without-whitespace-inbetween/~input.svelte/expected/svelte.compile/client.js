import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!><!><!><!>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var text = $.text('!');

			$.append($$anchor, text);
		};

		$.if(node, ($$render) => {
			if (name == "world") $$render(consequent);
		});
	}

	var node_1 = $.sibling(node);

	$.each(node_1, 16, () => x, $.index, ($$anchor, y) => {
		$.next();

		var text_1 = $.text('!');

		$.append($$anchor, text_1);
	});

	var node_2 = $.sibling(node_1);

	$.await(node_2, () => x, null, ($$anchor, y) => {
		var text_2 = $.text('!');

		$.append($$anchor, text_2);
	});

	var node_3 = $.sibling(node_2);

	{
		var consequent_1 = ($$anchor) => {
			var text_3 = $.text('*');

			$.append($$anchor, text_3);
		};

		$.if(node_3, ($$render) => {
			if (bla) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
}