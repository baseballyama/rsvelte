import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Group } from '@svelteuidev/core';

const code = `
<script>
    import { Button } from '@svelteuidev/core';
<\/script>

<Button compact>Click Me</Button>
<Button variant='outline' compact>Click Me</Button>
<Button variant='default' compact>Click Me</Button>
`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Button_demo_compact($$anchor) {
	Group($$anchor, {
		position: 'center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Button(node, {
				compact: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Click Me');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Button(node_1, {
				variant: 'outline',
				compact: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Click Me');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Button(node_2, {
				variant: 'default',
				compact: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Click Me');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}