import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Column, Grid, Row } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function OffsetColumns($$anchor) {
	Grid($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Row($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					Column(node, {
						sm: { span: 1, offset: 3 },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Offset 3');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_1 = $.sibling(node, 2);

					Column(node_1, {
						sm: { span: 2, offset: 2 },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Offset 2');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					Column(node_2, {
						sm: { span: 3, offset: 1 },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Offset 1');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					Column(node_3, {
						sm: { span: 4, offset: 0 },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Offset 0');

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