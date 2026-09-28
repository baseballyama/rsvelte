import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Center, Kbd } from '@svelteuidev/core';

const code = `
<script>
    import { Kbd } from '@svelteuidev/core';
<\/script>

<Kbd>⌘</Kbd> + <Kbd>shift</Kbd> + <Kbd>M</Kbd>
	`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> + <!> + <!>`, 1);

export default function Kbd_demo_usage($$anchor) {
	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Kbd(node, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('⌘');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Kbd(node_1, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('shift');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Kbd(node_2, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('M');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}