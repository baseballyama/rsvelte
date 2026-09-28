import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ActionIcon, Group } from '@svelteuidev/core';
import { Rocket } from 'radix-icons-svelte';

export const type = 'demo';
export const configuration = { toggle: true };

export default function ActionIcon_demo_colors($$anchor) {
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

	Group($$anchor, {
		position: 'center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 17, () => variants, $.index, ($$anchor, variant) => {
				Group($$anchor, {
					position: 'center',
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = $.comment();
						var node_1 = $.first_child(fragment_3);

						$.each(node_1, 17, () => colors, $.index, ($$anchor, color) => {
							ActionIcon($$anchor, {
								get variant() {
									return $.get(variant);
								},

								get color() {
									return $.get(color);
								},

								children: ($$anchor, $$slotProps) => {
									Rocket($$anchor, {});
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}