import * as $ from 'svelte/internal/server';
import { Button, Group } from '@svelteuidev/core';

const code = `
<script>
    import { Button } from '@svelteuidev/core';
<\/script>

<Button href="https://github.com/svelteuidev/svelteui">I go to svelteuidev/svelteui</Button>
`;

export const type = 'demo';
export const configuration = { code };

export default function Button_demo_root($$renderer) {
	Group($$renderer, {
		position: 'center',
		children: ($$renderer) => {
			Button($$renderer, {
				href: 'https://github.com/svelteuidev/svelteui',
				children: ($$renderer) => {
					$$renderer.push(`<!---->I go to svelteuidev/svelteui`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}