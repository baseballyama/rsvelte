import * as $ from 'svelte/internal/server';
import { Button, Group } from '@svelteuidev/core';

const code = `
<script>
	import { Button } from '@svelteuidev/core';
<\/script>

<Button color='blue' ripple>Click me!</Button>
<Button color='red' ripple>Click me!</Button>
<Button color='orange' ripple>Click me!</Button>
<Button color='pink' ripple>Click me!</Button>
<Button color='dark' ripple>Click me!</Button>
`;

export const type = 'demo';
export const configuration = { code };

export default function Button_demo_ripple($$renderer) {
	Group($$renderer, {
		position: 'center',
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(['blue', 'red', 'orange', 'pink', 'dark']);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let color = each_array[$$index];

				Button($$renderer, {
					color,
					ripple: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Click me!`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});
}