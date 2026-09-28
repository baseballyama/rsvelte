import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Text, Mark } from '@svelteuidev/core';

const code = `
<script>
	import { Text, Mark } from '@svelteuidev/core';
<\/script>

<Text>A bunch of text with a <Mark>highlighted bit</Mark> in it.</Text>
`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`A bunch of text with a <!> in it.`, 1);

export default function Mark_demo_usage($$anchor) {
	Text($$anchor, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();
			var node = $.sibling($.first_child(fragment_1));

			Mark(node, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('highlighted bit');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}