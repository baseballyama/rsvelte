import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>start</p> pre123 <!>`, 1);

export default function Main($$anchor) {
	let cond = true;
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 2);

	{
		var consequent = ($$anchor) => {
			var text = $.text('mid');

			$.append($$anchor, text);
		};

		$.if(node, ($$render) => {
			if (cond) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}