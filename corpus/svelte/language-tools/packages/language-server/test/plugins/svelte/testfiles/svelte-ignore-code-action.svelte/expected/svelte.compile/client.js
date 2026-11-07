import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a></a> <a href="">about</a>`, 1);
var root_1 = $.from_html(`<img/> <!>`, 1);

export default function Svelte_ignore_code_action($$anchor) {
	let value = "";
	let x = value;
	var fragment = root_1();
	var node = $.sibling($.first_child(fragment), 2);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root();

			$.next(2);
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (true) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}