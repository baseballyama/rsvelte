import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox, Stack } from '@svelteuidev/core';

const code = `<script>
    import { Checkbox } from '@svelteuidev/core';
<\/script>

<Checkbox checked size='xs' label='xs checkbox' />
<Checkbox checked size='sm' label='sm checkbox' />
<Checkbox checked size='md' label='md checkbox' />
<Checkbox checked size='lg' label='lg checkbox' />
<Checkbox checked size='xl' label='xl checkbox' />`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Checkbox_demo_sizes($$anchor) {
	Stack($$anchor, {
		position: 'center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Checkbox(node, { checked: true, size: 'xs', label: 'xs checkbox' });

			var node_1 = $.sibling(node, 2);

			Checkbox(node_1, { checked: true, size: 'sm', label: 'sm checkbox' });

			var node_2 = $.sibling(node_1, 2);

			Checkbox(node_2, { checked: true, size: 'md', label: 'md checkbox' });

			var node_3 = $.sibling(node_2, 2);

			Checkbox(node_3, { checked: true, size: 'lg', label: 'lg checkbox' });

			var node_4 = $.sibling(node_3, 2);

			Checkbox(node_4, { checked: true, size: 'xl', label: 'xl checkbox' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}