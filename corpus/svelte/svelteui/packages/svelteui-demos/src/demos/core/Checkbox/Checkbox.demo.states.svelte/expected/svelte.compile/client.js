import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox, Stack } from '@svelteuidev/core';

const code = `<script>
    import { Checkbox } from '@svelteuidev/core';
<\/script>

<Checkbox checked={false} label="Default checkbox" />
<Checkbox checked={false} indeterminate label="Indeterminate checkbox" />
<Checkbox checked label="Checked checkbox" />
<Checkbox disabled label="Disabled checkbox" />
<Checkbox disabled checked label="Disabled checked checkbox" />
<Checkbox disabled indeterminate label="Disabled indeterminate checkbox" />`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Checkbox_demo_states($$anchor) {
	Stack($$anchor, {
		position: 'center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Checkbox(node, { checked: false, label: 'Default checkbox' });

			var node_1 = $.sibling(node, 2);

			Checkbox(node_1, {
				checked: false,
				indeterminate: true,
				label: 'Indeterminate checkbox'
			});

			var node_2 = $.sibling(node_1, 2);

			Checkbox(node_2, { checked: true, label: 'Checked checkbox' });

			var node_3 = $.sibling(node_2, 2);

			Checkbox(node_3, { disabled: true, label: 'Disabled checkbox' });

			var node_4 = $.sibling(node_3, 2);

			Checkbox(node_4, {
				disabled: true,
				checked: true,
				label: 'Disabled checked checkbox'
			});

			var node_5 = $.sibling(node_4, 2);

			Checkbox(node_5, {
				disabled: true,
				indeterminate: true,
				label: 'Disabled indeterminate checkbox'
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}