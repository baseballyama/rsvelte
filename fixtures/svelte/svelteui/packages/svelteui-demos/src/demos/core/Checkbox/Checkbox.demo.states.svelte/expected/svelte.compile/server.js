import * as $ from 'svelte/internal/server';
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

export default function Checkbox_demo_states($$renderer) {
	Stack($$renderer, {
		position: 'center',
		children: ($$renderer) => {
			Checkbox($$renderer, { checked: false, label: 'Default checkbox' });
			$$renderer.push(`<!----> `);

			Checkbox($$renderer, {
				checked: false,
				indeterminate: true,
				label: 'Indeterminate checkbox'
			});

			$$renderer.push(`<!----> `);
			Checkbox($$renderer, { checked: true, label: 'Checked checkbox' });
			$$renderer.push(`<!----> `);
			Checkbox($$renderer, { disabled: true, label: 'Disabled checkbox' });
			$$renderer.push(`<!----> `);

			Checkbox($$renderer, {
				disabled: true,
				checked: true,
				label: 'Disabled checked checkbox'
			});

			$$renderer.push(`<!----> `);

			Checkbox($$renderer, {
				disabled: true,
				indeterminate: true,
				label: 'Disabled indeterminate checkbox'
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}