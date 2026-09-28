import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Badge, CloseButton, Group } from '@svelteuidev/core';

const code = `<script>
  import { Badge, CloseButton } from '@svelteuidev/core';
<\/script>

<Badge>
    Badge with right section
    <svelte:fragment slot='rightSection'>
        <CloseButton size='xs' iconSize='xs' color='blue' variant='transparent' />
    </svelte:fragment>
</Badge>

<Badge>
    Badge with left section
    <svelte:fragment slot='leftSection'>
        <CloseButton size='xs' iconSize='xs' color='blue' variant='transparent' />
    </svelte:fragment>
</Badge>`;

export const type = 'demo';
export const configuration = { code, toggle: true };

var root = $.from_html(`<!> <!>`, 1);

export default function Badge_demo_sections($$anchor) {
	Group($$anchor, {
		position: 'center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Badge(node, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Badge with right section');

					$.append($$anchor, text);
				},

				$$slots: {
					default: true,
					rightSection: ($$anchor, $$slotProps) => {
						CloseButton($$anchor, {
							size: 'xs',
							iconSize: 'xs',
							color: 'blue',
							variant: 'transparent'
						});
					}
				}
			});

			var node_1 = $.sibling(node, 2);

			Badge(node_1, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Badge with left section');

					$.append($$anchor, text_1);
				},

				$$slots: {
					default: true,
					leftSection: ($$anchor, $$slotProps) => {
						CloseButton($$anchor, {
							size: 'xs',
							iconSize: 'xs',
							color: 'blue',
							variant: 'transparent'
						});
					}
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}