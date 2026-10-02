import * as $ from 'svelte/internal/server';
import { Tabs } from '@svelteuidev/core';

const code = `<script>
	import { Tabs } from '@svelteuidev/core';
<\/script>

<Tabs color='teal'>
    <Tabs.Tab label='Teal tab'>Teal tab content</Tabs.Tab>
    <Tabs.Tab label='Still teal tab'>Teal tab content #2</Tabs.Tab>
    <Tabs.Tab label='Pink tab' color='pink'>Pink tab content</Tabs.Tab>
</Tabs>`;

export const type = 'demo';
export const configuration = { code };

export default function Tabs_demo_colors($$renderer) {
	Tabs($$renderer, {
		color: 'teal',
		children: ($$renderer) => {
			if (Tabs.Tab) {
				$$renderer.push('<!--[-->');

				Tabs.Tab($$renderer, {
					label: 'Teal tab',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Teal tab content`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Tabs.Tab) {
				$$renderer.push('<!--[-->');

				Tabs.Tab($$renderer, {
					label: 'Still teal tab',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Teal tab content #2`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Tabs.Tab) {
				$$renderer.push('<!--[-->');

				Tabs.Tab($$renderer, {
					label: 'Pink tab',
					color: 'pink',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Pink tab content`);
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