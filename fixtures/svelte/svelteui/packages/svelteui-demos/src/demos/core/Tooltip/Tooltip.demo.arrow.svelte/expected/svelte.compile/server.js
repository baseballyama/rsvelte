import * as $ from 'svelte/internal/server';
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

export default function Tooltip_demo_arrow($$renderer) {
	Center($$renderer, {
		override: { height: '80px', alignItems: 'flex-end' },
		children: ($$renderer) => {
			SimpleGrid($$renderer, {
				cols: 2,
				children: ($$renderer) => {
					Tooltip($$renderer, {
						withArrow: true,
						opened: true,
						label: 'Default arrow',
						children: ($$renderer) => {
							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Default arrow`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Tooltip($$renderer, {
						withArrow: true,
						opened: true,
						arrowSize: 3,
						label: 'Arrow with size',
						children: ($$renderer) => {
							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Arrow with size`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}