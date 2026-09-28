import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Center, SimpleGrid, Tooltip } from '@svelteuidev/core';

const code = `
<script>
  import { Button, Tooltip } from '@svelteuidev/core';
<\/script>

<Tooltip withArrow opened label='Default arrow'>
    <Button>Default arrow</Button>
</Tooltip>
<Tooltip withArrow opened arrowSize={3} label='Arrow with size'>
    <Button>Arrow with size</Button>
</Tooltip>
`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!>`, 1);

export default function Tooltip_demo_arrow($$anchor) {
	Center($$anchor, {
		override: { height: '80px', alignItems: 'flex-end' },
		children: ($$anchor, $$slotProps) => {
			SimpleGrid($$anchor, {
				cols: 2,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					Tooltip(node, {
						withArrow: true,
						opened: true,
						label: 'Default arrow',
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Default arrow');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_1 = $.sibling(node, 2);

					Tooltip(node_1, {
						withArrow: true,
						opened: true,
						arrowSize: 3,
						label: 'Arrow with size',
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Arrow with size');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
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