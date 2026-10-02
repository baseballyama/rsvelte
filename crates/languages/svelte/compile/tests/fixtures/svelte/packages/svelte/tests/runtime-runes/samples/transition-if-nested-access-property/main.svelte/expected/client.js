import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fade } from 'svelte/transition';

var root = $.from_html(`<p>keyed</p>`);
var root_1 = $.from_html(`<p>sibling</p>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<button>clear</button> <!>`, 1);

export default function Main($$anchor) {
	let data = $.state($.proxy({ id: 1 }));
	var fragment = root_3();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = root_2();
			var node_1 = $.first_child(fragment_1);

			$.key(node_1, () => $.get(data)?.id, ($$anchor) => {
				var p = root();

				$.transition(7, p, () => fade, () => ({ duration: 100 }));
				$.append($$anchor, p);
			});

			var node_2 = $.sibling(node_1, 2);

			{
				var consequent = ($$anchor) => {
					var p_1 = root_1();

					$.append($$anchor, p_1);
				};

				$.if(node_2, ($$render) => {
					if ($.get(data).id) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(data)) $$render(consequent_1);
		});
	}

	$.delegated('click', button, () => $.set(data, null));
	$.append($$anchor, fragment);
}

$.delegate(['click']);