import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CloseButton, Group } from '@svelteuidev/core';

const code = `<script>
    import { CloseButton } from '@svelteuidev/core';
<\/script>

<CloseButton aria-label="Close modal" />
<CloseButton size="xl" iconSize={20} />`;

export const type = 'demo';
export const configuration = { code, toggle: true };

var root = $.from_html(`<!> <!>`, 1);

export default function ActionIcon_demo_close($$anchor) {
	Group($$anchor, {
		position: 'center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			CloseButton(node, { 'aria-label': 'Close modal' });

			var node_1 = $.sibling(node, 2);

			CloseButton(node_1, { size: 'xl', iconSize: 'xl' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}