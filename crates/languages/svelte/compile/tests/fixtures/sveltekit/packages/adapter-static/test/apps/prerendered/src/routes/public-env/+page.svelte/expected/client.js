import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { browser } from '$app/env';
import { PUBLIC_ANSWER } from '$app/env/public';

var root = $.from_html(`<h2> </h2>`);
var root_1 = $.from_html(`<h1> </h1> <!>`, 1);

export default function _page($$anchor) {
	var fragment = root_1();
	var h1 = $.first_child(fragment);
	var text = $.only_child(h1);
	var node = $.sibling(h1, 2);

	{
		var consequent = ($$anchor) => {
			var h2 = root();
			var text_1 = $.only_child(h2);

			$.template_effect(() => $.set_text(text_1, `The dynamic answer is ${PUBLIC_ANSWER ?? ''}`));
			$.append($$anchor, h2);
		};

		$.if(node, ($$render) => {
			if (browser) $$render(consequent);
		});
	}

	$.template_effect(() => $.set_text(text, `The answer is ${PUBLIC_ANSWER ?? ''}`));
	$.append($$anchor, fragment);
}