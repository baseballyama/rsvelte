import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Box, Code, Group } from '@svelteuidev/core';

const code = `
<script>
	import { Box, Code } from '@svelteuidev/core';
<\/script>

<Box root={Code}>I am a code component now</Box>
<Box root='span'>I am a span tag</Box>`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!>`, 1);

export default function Box_demo_custom($$anchor) {
	Group($$anchor, {
		position: 'center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Box(node, {
				get root() {
					return Code;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('I am a code component now');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Box(node_1, {
				root: 'span',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('I am a span tag');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}