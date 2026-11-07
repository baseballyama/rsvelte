import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var text = $.text('bar');

			$.append($$anchor, text);
		};

		$.if(node, ($$render) => {
			if (foo) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}