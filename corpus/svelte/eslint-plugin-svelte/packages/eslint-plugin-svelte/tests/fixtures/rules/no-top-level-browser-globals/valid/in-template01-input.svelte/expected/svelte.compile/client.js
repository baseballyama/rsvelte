import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { browser } from '$app/environment';

export default function In_template01_input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var text = $.text();

			text.nodeValue = location.href;
			$.append($$anchor, text);
		};

		$.if(node, ($$render) => {
			if (browser) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}