import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>lift-off!</p>`);
var root_1 = $.from_html(`<p> </p> <!>`, 1);

export default function Input($$anchor, $$props) {
	let n = $.prop($$props, 'n', 3, 5);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = root_1();
			var p_1 = $.first_child(fragment_1);
			var text = $.only_child(p_1, true);
			var node_1 = $.sibling(p_1, 2);

			{
				let $0 = $.derived(() => n() - 1);

				Input(node_1, {
					get n() {
						return $.get($0);
					}
				});
			}

			$.template_effect(() => $.set_text(text, n()));
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (n() === 0) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
}