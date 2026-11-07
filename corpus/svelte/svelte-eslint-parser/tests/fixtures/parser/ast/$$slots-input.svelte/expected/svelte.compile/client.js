import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function $$slots_input($$anchor, $$props) {
	const $$slots = $.sanitize_slots($$props);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {};

		$.if(node, ($$render) => {
			if ($$slots.labelText) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}