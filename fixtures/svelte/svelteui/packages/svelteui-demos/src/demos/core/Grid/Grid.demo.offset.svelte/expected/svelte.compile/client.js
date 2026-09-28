import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Grid } from '@svelteuidev/core';
import { default as ColWrapper } from './ColWrapper.svelte';

const code = `<script>
	import { Grid } from '@svelteuidev/core';
<\/script>

<Grid>
    <Grid.Col span={3}>1</Grid.Col>
    <Grid.Col span={3}>2</Grid.Col>
    <Grid.Col span={3} offset={3}>3</Grid.Col>
</Grid>
`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Grid_demo_offset($$anchor) {
	Grid($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.component(node, () => Grid.Col, ($$anchor, Grid_Col) => {
				Grid_Col($$anchor, {
					span: 3,
					children: ($$anchor, $$slotProps) => {
						ColWrapper($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('1');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => Grid.Col, ($$anchor, Grid_Col_1) => {
				Grid_Col_1($$anchor, {
					span: 3,
					children: ($$anchor, $$slotProps) => {
						ColWrapper($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text('2');

								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			});

			var node_2 = $.sibling(node_1, 2);

			$.component(node_2, () => Grid.Col, ($$anchor, Grid_Col_2) => {
				Grid_Col_2($$anchor, {
					span: 3,
					offset: 3,
					children: ($$anchor, $$slotProps) => {
						ColWrapper($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text('3');

								$.append($$anchor, text_2);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}