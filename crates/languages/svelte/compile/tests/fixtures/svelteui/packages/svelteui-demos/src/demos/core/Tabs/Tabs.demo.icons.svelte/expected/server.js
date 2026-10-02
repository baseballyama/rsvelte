import * as $ from 'svelte/internal/server';
import { Tabs } from '@svelteuidev/core';
import { Camera, EnvelopeClosed, Gear } from 'radix-icons-svelte';

const code = `<script>
	import { Tabs } from '@svelteuidev/core';
    import { Camera, EnvelopeClosed, Gear } from 'radix-icons-svelte';
<\/script>

<Tabs>
    <Tabs.Tab label='Gallery' icon={Camera}>Gallery tab content</Tabs.Tab>
    <Tabs.Tab label='Messages' icon={EnvelopeClosed}>Messages tab content</Tabs.Tab>
    <Tabs.Tab icon={Gear}>Settings tab content</Tabs.Tab>
</Tabs>`;

export const type = 'demo';
export const configuration = { code };

export default function Tabs_demo_icons($$renderer) {
	Tabs($$renderer, {
		children: ($$renderer) => {
			if (Tabs.Tab) {
				$$renderer.push('<!--[-->');

				Tabs.Tab($$renderer, {
					label: 'Gallery',
					icon: Camera,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Gallery tab content`);
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
					label: 'Messages',
					icon: EnvelopeClosed,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Messages tab content`);
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
					icon: Gear,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Settings tab content`);
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