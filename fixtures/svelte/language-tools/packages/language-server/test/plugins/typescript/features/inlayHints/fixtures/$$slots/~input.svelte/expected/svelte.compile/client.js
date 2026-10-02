import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><!></div>`);

export default function Input($$anchor, $$props) {
	const $$slots = $.sanitize_slots($$props);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			$.slot(node_1, $$props, 'default', {}, null);
			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($$slots.default) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}