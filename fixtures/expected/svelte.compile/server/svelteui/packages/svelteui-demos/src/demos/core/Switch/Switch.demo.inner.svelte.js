import * as $ from 'svelte/internal/server';
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

export default function Switch_demo_inner($$renderer) {
	Group($$renderer, {
		position: 'center',
		children: ($$renderer) => {
			Switch($$renderer, { size: 'sm', onLabel: 'ON', offLabel: 'OFF' });
			$$renderer.push(`<!----> `);
			Switch($$renderer, { size: 'md', onLabel: 'ON', offLabel: 'OFF' });
			$$renderer.push(`<!----> `);
			Switch($$renderer, { size: 'lg', onLabel: 'ON', offLabel: 'OFF' });
			$$renderer.push(`<!----> `);
			Switch($$renderer, { size: 'xl', onLabel: 'ON', offLabel: 'OFF' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}