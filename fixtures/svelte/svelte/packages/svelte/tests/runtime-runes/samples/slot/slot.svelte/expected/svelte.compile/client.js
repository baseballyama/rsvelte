import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Slot($$anchor, $$props) {
	const $$slots = $.sanitize_slots($$props);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.slot(node_1, $$props, 'default', {}, null);
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($$slots) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}