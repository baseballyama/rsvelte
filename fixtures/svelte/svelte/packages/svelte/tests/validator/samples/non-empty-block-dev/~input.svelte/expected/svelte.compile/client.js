import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	let x;
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var text = $.text(' ');

			$.append($$anchor, text);
		};

		$.if(node, ($$render) => {
			if (x) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}