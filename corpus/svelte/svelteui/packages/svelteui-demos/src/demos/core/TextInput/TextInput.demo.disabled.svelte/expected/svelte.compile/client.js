import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Center, Stack, TextInput } from '@svelteuidev/core';

const code = `
<script>
    import { TextInput } from '@svelteuidev/core';
<\/script>

<TextInput disabled label='Disabled without value' placeholder='Your email' />
<TextInput disabled label='Disabled with value' value='you@email.com' />
`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!>`, 1);

export default function TextInput_demo_disabled($$anchor) {
	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Stack($$anchor, {
				position: 'center',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					TextInput(node, {
						disabled: true,
						label: 'Disabled without value',
						placeholder: 'Your email'
					});

					var node_1 = $.sibling(node, 2);

					TextInput(node_1, {
						disabled: true,
						label: 'Disabled with value',
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