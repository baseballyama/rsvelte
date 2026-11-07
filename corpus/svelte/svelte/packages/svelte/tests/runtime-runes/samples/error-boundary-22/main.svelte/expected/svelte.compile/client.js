import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from "./Child.svelte";

var root = $.from_html(`<p>error occurred</p>`);
var root_1 = $.from_html(`<p>This should be removed</p> <!>`, 1);

export default function Main($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const failed = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		$.boundary(node, { failed }, ($$anchor) => {
			var fragment_1 = root_1();
			var node_1 = $.sibling($.first_child(fragment_1), 2);

			{
				var consequent = ($$anchor) => {
					Child($$anchor, {});
				};

				$.if(node_1, ($$render) => {
					if (true) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_1);
		});
	}

	$.append($$anchor, fragment);
}