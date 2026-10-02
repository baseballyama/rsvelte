import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Group, Switch } from '@svelteuidev/core';

const code = `<script>
	import { Switch } from '@svelteuidev/core';
<\/script>

<Switch size='sm' onLabel="ON" offLabel="OFF" />
<Switch size='md' onLabel="ON" offLabel="OFF" />
<Switch size='lg' onLabel="ON" offLabel="OFF" />
<Switch size='xl' onLabel="ON" offLabel="OFF" />
`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Switch_demo_inner($$anchor) {
	Group($$anchor, {
		position: 'center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Switch(node, { size: 'sm', onLabel: 'ON', offLabel: 'OFF' });

			var node_1 = $.sibling(node, 2);

			Switch(node_1, { size: 'md', onLabel: 'ON', offLabel: 'OFF' });

			var node_2 = $.sibling(node_1, 2);

			Switch(node_2, { size: 'lg', onLabel: 'ON', offLabel: 'OFF' });

			var node_3 = $.sibling(node_2, 2);

			Switch(node_3, { size: 'xl', onLabel: 'ON', offLabel: 'OFF' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}