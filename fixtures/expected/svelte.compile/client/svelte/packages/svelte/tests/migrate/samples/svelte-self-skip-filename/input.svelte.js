import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			Input(node_1, {});
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (false) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}