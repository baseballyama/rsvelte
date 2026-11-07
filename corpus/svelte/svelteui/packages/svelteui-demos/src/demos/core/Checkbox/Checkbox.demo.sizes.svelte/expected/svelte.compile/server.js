import * as $ from 'svelte/internal/server';
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

export default function Checkbox_demo_sizes($$renderer) {
	Stack($$renderer, {
		position: 'center',
		children: ($$renderer) => {
			Checkbox($$renderer, { checked: true, size: 'xs', label: 'xs checkbox' });
			$$renderer.push(`<!----> `);
			Checkbox($$renderer, { checked: true, size: 'sm', label: 'sm checkbox' });
			$$renderer.push(`<!----> `);
			Checkbox($$renderer, { checked: true, size: 'md', label: 'md checkbox' });
			$$renderer.push(`<!----> `);
			Checkbox($$renderer, { checked: true, size: 'lg', label: 'lg checkbox' });
			$$renderer.push(`<!----> `);
			Checkbox($$renderer, { checked: true, size: 'xl', label: 'xl checkbox' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}