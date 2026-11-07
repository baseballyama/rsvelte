import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Center, Stack, TextInput } from '@svelteuidev/core';

const code = `
<script>
    import { TextInput } from '@svelteuidev/core';
<\/script>

<TextInput error label='Your email' value='you@email.com' \/>
<TextInput error='Invalid email' label='Your email' value='you@email.com' \/>
`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!>`, 1);

export default function TextInput_demo_invalid($$anchor) {
	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Stack($$anchor, {
				position: 'center',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					TextInput(node, { error: true, label: 'Your email', value: 'you@email.com' });

					var node_1 = $.sibling(node, 2);

					TextInput(node_1, {
						error: 'Invalid email',
						label: 'Your email',
						value: 'you@email.com'
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}