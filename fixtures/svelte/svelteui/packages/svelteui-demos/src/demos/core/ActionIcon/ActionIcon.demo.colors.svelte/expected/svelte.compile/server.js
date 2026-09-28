import * as $ from 'svelte/internal/server';
import { ActionIcon, Group } from '@svelteuidev/core';
import { Rocket } from 'radix-icons-svelte';

export const type = 'demo';
export const configuration = { toggle: true };

export default function ActionIcon_demo_colors($$renderer) {
	let variants = ['hover', 'outline', 'light', 'filled'];

	let colors = [
		'dark',
		'gray',
		'red',
		'pink',
		'grape',
		'violet',
		'indigo',
		'blue',
		'cyan',
		'teal',
		'green',
		'lime',
		'yellow',
		'orange'
	];

	Group($$renderer, {
		position: 'center',
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(variants);

			for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
				let variant = each_array[$$index_1];

				Group($$renderer, {
					position: 'center',
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array_1 = $.ensure_array_like(colors);

						for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
							let color = each_array_1[$$index];

							ActionIcon($$renderer, {
								variant,
								color,
								children: ($$renderer) => {
									Rocket($$renderer, {});
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});
}