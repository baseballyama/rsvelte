import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>cond</p>`);
var root_1 = $.from_html(`<p>start</p><!>`, 1);

export default function Main($$anchor) {
	const cond = true;
	var fragment = root_1();
	var node = $.sibling($.first_child(fragment));

	{
		var consequent = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if (cond) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}