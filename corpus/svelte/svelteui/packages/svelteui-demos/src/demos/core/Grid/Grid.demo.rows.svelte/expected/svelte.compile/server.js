import * as $ from 'svelte/internal/server';
import { Grid } from '@svelteuidev/core';
import { default as ColWrapper } from './ColWrapper.svelte';

const code = `<script>
	import { Grid } from '@svelteuidev/core';
<\/script>

<Grid>
    <Grid.Col span={4}>1</Grid.Col>
    <Grid.Col span={4}>2</Grid.Col>
    <Grid.Col span={4}>3</Grid.Col>
    <Grid.Col span={4}>4</Grid.Col>
</Grid>
`;

export const type = 'demo';
export const configuration = { code };

export default function Grid_demo_rows($$renderer) {
	Grid($$renderer, {
		children: ($$renderer) => {
			if (Grid.Col) {
				$$renderer.push('<!--[-->');

				Grid.Col($$renderer, {
					span: 4,
					children: ($$renderer) => {
						ColWrapper($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->1`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Grid.Col) {
				$$renderer.push('<!--[-->');

				Grid.Col($$renderer, {
					span: 4,
					children: ($$renderer) => {
						ColWrapper($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->2`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Grid.Col) {
				$$renderer.push('<!--[-->');

				Grid.Col($$renderer, {
					span: 4,
					children: ($$renderer) => {
						ColWrapper($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->3`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Grid.Col) {
				$$renderer.push('<!--[-->');

				Grid.Col($$renderer, {
					span: 4,
					children: ($$renderer) => {
						ColWrapper($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->4`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});
}