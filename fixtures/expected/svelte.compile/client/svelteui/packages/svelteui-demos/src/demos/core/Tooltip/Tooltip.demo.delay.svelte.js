import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Center, Tooltip } from '@svelteuidev/core';

const code = `
<script>
  import { Button, Tooltip } from '@svelteuidev/core';
<\/script>

<Tooltip label="Opened after 500ms" openDelay={500}>
    <Button variant="outline">Delay open - 500ms</Button>
</Tooltip>

<Tooltip label="Closes after 500ms" closeDelay={500}>
    <Button variant="outline">Delay close - 500ms</Button>
</Tooltip>
`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!>`, 1);

export default function Tooltip_demo_delay($$anchor) {
	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Tooltip(node, {
				override: { marginRight: '10px' },
				label: 'Opened after 500ms',
				openDelay: 500,
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						variant: 'outline',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Delay open - 500ms');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Tooltip(node_1, {
				label: 'Closes after 500ms',
				closeDelay: 500,
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						variant: 'outline',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Delay close - 500ms');

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