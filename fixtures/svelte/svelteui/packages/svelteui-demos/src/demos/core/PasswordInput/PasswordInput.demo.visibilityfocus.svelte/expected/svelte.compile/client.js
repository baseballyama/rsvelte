import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Center, Stack, PasswordInput } from '@svelteuidev/core';

const code = `
<script>
  import { PasswordInput } from '@svelteuidev/core';
<\/script>

<PasswordInput label="Unfocusable toggle"  />
<PasswordInput label="Focusable toggle" toggleTabIndex={0} />
`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!>`, 1);

export default function PasswordInput_demo_visibilityfocus($$anchor) {
	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Stack($$anchor, {
				position: 'center',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					PasswordInput(node, { label: 'Unfocusable toggle' });

					var node_1 = $.sibling(node, 2);

					PasswordInput(node_1, { label: 'Focusable toggle', toggleTabIndex: 0 });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}