import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Column, Grid, Row } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function AspectRatioColumns($$anchor) {
	Grid($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Row($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					Column(node, {
						aspectRatio: '2x1',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('2x1');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_1 = $.sibling(node, 2);

					Column(node_1, {
						aspectRatio: '2x1',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('2x1');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}