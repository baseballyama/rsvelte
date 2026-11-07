import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Comp from './diagnostics-ignore-generated-imported.svelte';

var root = $.from_html(` <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = root();
			var text = $.first_child(fragment_1);

			text.nodeValue = `${a === true} `;

			var node_1 = $.sibling(text);

			$.each(node_1, 16, () => [true], $.index, ($$anchor, a) => {
				$.next();

				var text_1 = $.text();

				$.template_effect(() => $.set_text(text_1, a === true));
				$.append($$anchor, text_1);
			});

			var node_2 = $.sibling(node_1, 2);

			{
				var consequent = ($$anchor) => {
					var text_2 = $.text();

					text_2.nodeValue = b;
					$.append($$anchor, text_2);
				};

				$.if(node_2, ($$render) => {
					if (b) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (typeof a === 'string') $$render(consequent_1);
		});
	}

	var node_3 = $.sibling(node, 2);

	Comp(node_3, {
		variant: 'food',
		style: `${1}`,
		$$events: { click: () => {} }
	});

	$.append($$anchor, fragment);
}