import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>fades in and out when x or y change</p> <p>fades in and out only when y changes</p>`, 1);

export default function _7_input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = root();
					var p = $.first_child(fragment_2);
					var p_1 = $.sibling(p, 2);

					$.transition(3, p, () => fade);
					$.transition(3, p_1, () => fade);
					$.append($$anchor, fragment_2);
				};

				$.if(node_1, ($$render) => {
					if (y) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (x) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
}