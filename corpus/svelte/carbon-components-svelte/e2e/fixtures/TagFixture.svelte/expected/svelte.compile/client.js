import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tag } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function TagFixture($$anchor) {
	let showTag = true;
	var fragment = root();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			Tag($$anchor, {
				'data-testid': 'tag-filter',
				filter: true,
				title: 'Clear filter',
				$$events: { close: () => showTag = false },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Carbon');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		};

		$.if(node, ($$render) => {
			if (showTag) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	Tag(node_1, {
		'data-testid': 'tag-static',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Static tag');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}