import * as $ from 'svelte/internal/server';
import { Button, Group } from '@svelteuidev/core';

const code = `
	<script>
		import { Button } from '@svelteuidev/core';
	<\/script>
	
	<Button variant="filled">filled</Button>
	<Button variant="light">light</Button>
	<Button variant="outline">outline</Button>
	<Button variant="default">default</Button>
	<Button variant="subtle">subtle</Button>
	`;

export const type = 'demo';
export const configuration = { code, toggle: true };

let variants = ['filled', 'light', 'outline', 'default', 'subtle'];

export default function Button_demo_variants($$renderer) {
	Group($$renderer, {
		position: 'center',
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(variants);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let variant = each_array[$$index];

				Button($$renderer, {
					variant,
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(variant)}`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});
}