import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Center, Stack, Textarea } from '@svelteuidev/core';

const code = `
<script>
  import { Textarea } from '@svelteuidev/core';
<\/script>

<Textarea error label="Your story" value="Once upon a land" />
<Textarea
  error='Stories must begin with "Once upon a time"'
  label="Your story"
  value="Once upon a land"
/>
`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!>`, 1);

export default function Textarea_demo_invalid($$anchor) {
	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Stack($$anchor, {
				justify: 'center',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					Textarea(node, { error: true, label: 'Your story', value: 'Once upon a land' });

					var node_1 = $.sibling(node, 2);

					Textarea(node_1, {
						error: `Stories must begin with "Once upon a time"`,
						label: 'Your story',
						value: 'Once upon a land'
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}