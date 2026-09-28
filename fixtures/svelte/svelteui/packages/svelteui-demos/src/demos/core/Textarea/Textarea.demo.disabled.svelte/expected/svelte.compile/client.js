import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Center, Stack, Textarea } from '@svelteuidev/core';

const code = `
<script>
  import { Textarea } from '@svelteuidev/core';
<\/script>

<Textarea disabled label="Disabled without value" placeholder="Once upon a time" />
<Textarea disabled label="Disabled with value" value="Once upon a time in a far away kingdom" />
`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!>`, 1);

export default function Textarea_demo_disabled($$anchor) {
	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Stack($$anchor, {
				justify: 'center',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					Textarea(node, {
						disabled: true,
						label: 'Disabled without value',
						placeholder: 'Once upon a time'
					});

					var node_1 = $.sibling(node, 2);

					Textarea(node_1, {
						disabled: true,
						label: 'Disabled with value',
						value: 'Once upon a time in a far away kingdom'
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}