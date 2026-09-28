import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chip, Group, Stack } from '@svelteuidev/core';

const code = `<script>
    import { Chip } from '@svelteuidev/core';
<\/script>

<Chip variant="outline">Outline default</Chip>
<Chip variant="outline" checked>Outline checked</Chip>
<Chip variant="outline" checked disabled>Outline checked disabled</Chip>
<Chip variant="filled">Filled default</Chip>
<Chip variant="filled" checked>Filled checked</Chip>
<Chip variant="filled" checked disabled>Filled checked disabled</Chip>`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Chip_demo_states($$anchor) {
	Stack($$anchor, {
		align: 'center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			Group(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					Chip(node_1, {
						variant: 'outline',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Outline default');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					Chip(node_2, {
						variant: 'outline',
						checked: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Outline checked');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					Chip(node_3, {
						variant: 'outline',
						checked: true,
						disabled: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Outline checked disabled');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node, 2);

			Group(node_4, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root();
					var node_5 = $.first_child(fragment_3);

					Chip(node_5, {
						variant: 'filled',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Filled default');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					Chip(node_6, {
						variant: 'filled',
						checked: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Filled checked');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					Chip(node_7, {
						variant: 'filled',
						checked: true,
						disabled: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Filled checked disabled');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}