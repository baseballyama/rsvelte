import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Badge, Box, Group } from '@svelteuidev/core';

const code = `<script>
  import { Badge, Box } from '@svelteuidev/core';
<\/script>

<Box>
    <Badge variant="filled" fullWidth>
        Full width badge
    </Badge>
</Box>

<Box>
    <Badge variant="filled" fullWidth>
        Badge with overflow
    </Badge>
</Box>`;

export const type = 'demo';
export const configuration = { code, toggle: true };

var root = $.from_html(`<!> <!>`, 1);

export default function Badge_demo_width($$anchor) {
	Group($$anchor, {
		position: 'center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Box(node, {
				css: { width: 200 },
				children: ($$anchor, $$slotProps) => {
					Badge($$anchor, {
						variant: 'filled',
						fullWidth: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Full width badge');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Box(node_1, {
				css: { width: 120 },
				children: ($$anchor, $$slotProps) => {
					Badge($$anchor, {
						variant: 'filled',
						fullWidth: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Badge with overflow');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}