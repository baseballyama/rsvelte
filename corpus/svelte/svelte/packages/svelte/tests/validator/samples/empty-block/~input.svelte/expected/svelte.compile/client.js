import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Input($$anchor) {
	let things = [];
	var fragment = root();
	var node = $.first_child(fragment);

	$.each(node, 17, () => things, $.index, ($$anchor, thing) => {});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {};

		$.if(node_1, ($$render) => {
			if (true) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	$.key(node_2, () => things, ($$anchor) => {
		var text = $.text('x');

		$.append($$anchor, text);
	});

	var node_3 = $.sibling(node_2, 2);

	$.await(node_3, () => promise, ($$anchor) => {
		var text_1 = $.text();

		$.template_effect(() => $.set_text(text_1, things));
		$.append($$anchor, text_1);
	});

	var node_4 = $.sibling(node_3, 2);

	$.each(node_4, 17, () => things, $.index, ($$anchor, thing) => {});

	var node_5 = $.sibling(node_4, 2);

	{
		var consequent_1 = ($$anchor) => {};

		$.if(node_5, ($$render) => {
			if (true) $$render(consequent_1);
		});
	}

	var node_6 = $.sibling(node_5, 2);

	$.key(node_6, () => things, ($$anchor) => {});

	var node_7 = $.sibling(node_6, 2);

	$.await(node_7, () => promise, ($$anchor) => {});
	$.append($$anchor, fragment);
}