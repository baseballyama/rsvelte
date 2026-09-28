import * as $ from 'svelte/internal/server';
import { Button, Group } from '@svelteuidev/core';

const code = `
<script>
    import { Button } from '@svelteuidev/core';
<\/script>

<Button compact>Click Me</Button>
<Button variant='outline' compact>Click Me</Button>
<Button variant='default' compact>Click Me</Button>
`;

export const type = 'demo';
export const configuration = { code };

export default function Button_demo_compact($$renderer) {
	Group($$renderer, {
		position: 'center',
		children: ($$renderer) => {
			Button($$renderer, {
				compact: true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Click Me`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				variant: 'outline',
				compact: true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Click Me`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				variant: 'default',
				compact: true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Click Me`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}