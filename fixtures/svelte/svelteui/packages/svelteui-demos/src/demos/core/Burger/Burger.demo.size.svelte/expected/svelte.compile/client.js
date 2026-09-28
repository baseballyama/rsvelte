import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Burger, Center, SimpleGrid } from '@svelteuidev/core';

const code = `
<script>
	import { Burger } from '@svelteuidev/core';
<\/script>

<Burger size='xs' />
<Burger size='sm' />
<Burger size='md' />
<Burger size='lg' />
<Burger size='xl' />`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Burger_demo_size($$anchor) {
	let opened = [];

	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			SimpleGrid($$anchor, {
				cols: 5,
				override: { alignItems: 'center' },
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					Burger(node, {
						size: 'xs',
						get opened() {
							return opened[0];
						},
						$$events: { click: () => opened[0] = !opened[0] }
					});

					var node_1 = $.sibling(node, 2);

					Burger(node_1, {
						size: 'sm',
						get opened() {
							return opened[1];
						},
						$$events: { click: () => opened[1] = !opened[1] }
					});

					var node_2 = $.sibling(node_1, 2);

					Burger(node_2, {
						size: 'md',
						get opened() {
							return opened[2];
						},
						$$events: { click: () => opened[2] = !opened[2] }
					});

					var node_3 = $.sibling(node_2, 2);

					Burger(node_3, {
						size: 'lg',
						get opened() {
							return opened[3];
						},
						$$events: { click: () => opened[3] = !opened[3] }
					});

					var node_4 = $.sibling(node_3, 2);

					Burger(node_4, {
						size: 'xl',
						get opened() {
							return opened[4];
						},
						$$events: { click: () => opened[4] = !opened[4] }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}