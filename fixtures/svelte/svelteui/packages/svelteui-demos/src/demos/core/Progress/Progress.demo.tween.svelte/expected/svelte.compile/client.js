import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Progress, Space, Group, Button } from '@svelteuidev/core';

const code = `
<Progress tween bind:value />
`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Progress_demo_tween($$anchor) {
	let value = 10;
	var fragment = root_1();
	var node = $.first_child(fragment);

	Progress(node, {
		tween: true,
		size: 'lg',
		get value() {
			return value;
		},

		set value($$value) {
			value = $$value;
		}
	});

	var node_1 = $.sibling(node, 2);

	Space(node_1, { h: 'lg' });

	var node_2 = $.sibling(node_1, 2);

	Group(node_2, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_3 = $.first_child(fragment_1);

			Button(node_3, {
				$$events: { click: () => value += 10 },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Increment');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			Button(node_4, {
				$$events: { click: () => value -= 10 },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Decrement');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}