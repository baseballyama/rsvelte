import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(`<p>hello</p>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Main($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	Child(node, {});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		$.if(node_1, ($$render) => {
			if (true) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}