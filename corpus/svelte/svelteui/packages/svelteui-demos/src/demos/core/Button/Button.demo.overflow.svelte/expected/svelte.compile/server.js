import * as $ from 'svelte/internal/server';
import { Button, Group } from '@svelteuidev/core';

const code = `
<script>
    import { Button } from '@svelteuidev/core';
<\/script>

<Button fullSize>Click Me</Button>
`;

export const type = 'demo';
export const configuration = { code };

export default function Button_demo_overflow($$renderer) {
	Group($$renderer, {
		position: 'center',
		children: ($$renderer) => {
			Button($$renderer, {
				fullSize: true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Click Me`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}