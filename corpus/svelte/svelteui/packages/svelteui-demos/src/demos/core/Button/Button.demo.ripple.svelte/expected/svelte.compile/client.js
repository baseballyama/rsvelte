import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function Button_demo_ripple($$anchor) {
	Group($$anchor, {
		position: 'center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 16, () => ['blue', 'red', 'orange', 'pink', 'dark'], $.index, ($$anchor, color) => {
				Button($$anchor, {
					get color() {
						return color;
					},
					ripple: true,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Click me!');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}