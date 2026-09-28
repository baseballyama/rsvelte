import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Column, Grid, Row } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function ResponsiveGrid($$anchor) {
	Grid($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Row($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					Column(node, {
						sm: 1,
						md: 4,
						lg: 8,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('sm: 1, md: 4, lg: 8');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_1 = $.sibling(node, 2);

					Column(node_1, {
						sm: 1,
						md: 2,
						lg: 2,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('sm: 1, md: 2, lg: 2');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					Column(node_2, {
						sm: 1,
						md: 1,
						lg: 1,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('sm: 1, md: 1, lg: 1');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					Column(node_3, {
						sm: 1,
						md: 1,
						lg: 1,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('sm: 1, md: 1, lg: 1');

							$.append($$anchor, text_3);
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