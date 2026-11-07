import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { browser, dev } from '$app/environment';

var root = $.from_html(`<div></div>`);

export default function Complex_guards01_input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			div.textContent = localStorage.getItem('myCat');
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (browser && dev) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}