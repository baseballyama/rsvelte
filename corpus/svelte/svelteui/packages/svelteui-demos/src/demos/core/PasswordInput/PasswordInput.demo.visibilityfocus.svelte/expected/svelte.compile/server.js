import * as $ from 'svelte/internal/server';
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

export default function PasswordInput_demo_visibilityfocus($$renderer) {
	Center($$renderer, {
		children: ($$renderer) => {
			Stack($$renderer, {
				position: 'center',
				children: ($$renderer) => {
					PasswordInput($$renderer, { label: 'Unfocusable toggle' });
					$$renderer.push(`<!----> `);
					PasswordInput($$renderer, { label: 'Focusable toggle', toggleTabIndex: 0 });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}