import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Center, Stack, PasswordInput } from '@svelteuidev/core';

const code = `
<script>
  import { PasswordInput } from '@svelteuidev/core';
<\/script>

<PasswordInput error label='Password' value='blahblah' \/>
<PasswordInput error='Invalid email' label='Password' value='blahblah' \/>
`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!>`, 1);

export default function PasswordInput_demo_invalid($$anchor) {
	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Stack($$anchor, {
				position: 'center',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					PasswordInput(node, { error: true, label: 'Password', value: 'blahblah' });

					var node_1 = $.sibling(node, 2);

					PasswordInput(node_1, {
						error: 'Invalid password',
						label: 'Password',
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