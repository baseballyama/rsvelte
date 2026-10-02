import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { browser } from '$app/environment';

export default function In_template03_input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var text = $.text('Server-side.');

			$.append($$anchor, text);
		};

		var alternate = ($$anchor) => {
			var text_1 = $.text();

			text_1.nodeValue = location.href;
			$.append($$anchor, text_1);
		};

		$.if(node, ($$render) => {
			if (!browser) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
}