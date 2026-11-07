import * as $ from 'svelte/internal/server';
import { Tabs } from '@svelteuidev/core';

const code = `<script>
	import { Tabs } from '@svelteuidev/core';
<\/script>

<Tabs>
    <Tabs.Tab label="First" title="Reveal hidden truth on long mouse over">
        First tab content
    </Tabs.Tab>
    <Tabs.Tab label="Not allowed" disabled>
        https://youtu.be/dQw4w9WgXcQ
    </Tabs.Tab>
    <Tabs.Tab label="Delete this?" color="red" override={{ fontWeight: 500 }}>
        Yes, delete this
    </Tabs.Tab>
</Tabs>`;

export const type = 'demo';
export const configuration = { code };

export default function Tabs_demo_component($$renderer) {
	Tabs($$renderer, {
		children: ($$renderer) => {
			if (Tabs.Tab) {
				$$renderer.push('<!--[-->');

				Tabs.Tab($$renderer, {
					label: 'First',
					title: 'Reveal hidden truth on long mouse over',
					children: ($$renderer) => {
						$$renderer.push(`<!---->First tab content`);
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
					label: 'Not allowed',
					disabled: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->https://youtu.be/dQw4w9WgXcQ`);
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
					label: 'Delete this?',
					color: 'red',
					override: { backgroundColor: 'red' },
					children: ($$renderer) => {
						$$renderer.push(`<!---->Yes, delete this`);
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