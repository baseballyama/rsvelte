import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Center, Stack, PasswordInput } from '@svelteuidev/core';

const code = `
<script>
    import { PasswordInput } from '@svelteuidev/core';
<\/script>

<PasswordInput disabled label='Disabled without value' placeholder='Password' />
<PasswordInput disabled label='Disabled with value' value='blahblah' />
`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!>`, 1);

export default function PasswordInput_demo_disabled($$anchor) {
	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Stack($$anchor, {
				position: 'center',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					PasswordInput(node, {
						disabled: true,
						label: 'Disabled without value',
						placeholder: 'Password'
					});

					var node_1 = $.sibling(node, 2);

					PasswordInput(node_1, {
						disabled: true,
						label: 'Disabled with value',
						value: 'blahblah'
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}