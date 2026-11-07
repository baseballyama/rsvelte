import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var text = $.text('hello');

			$.append($$anchor, text);
		};

		$.if(node, ($$render) => {
			if (true) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}