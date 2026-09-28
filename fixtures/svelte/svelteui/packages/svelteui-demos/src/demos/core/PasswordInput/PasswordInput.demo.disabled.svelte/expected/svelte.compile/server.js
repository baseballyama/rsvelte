import * as $ from 'svelte/internal/server';
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

export default function PasswordInput_demo_disabled($$renderer) {
	Center($$renderer, {
		children: ($$renderer) => {
			Stack($$renderer, {
				position: 'center',
				children: ($$renderer) => {
					PasswordInput($$renderer, {
						disabled: true,
						label: 'Disabled without value',
						placeholder: 'Password'
					});

					$$renderer.push(`<!----> `);

					PasswordInput($$renderer, {
						disabled: true,
						label: 'Disabled with value',
						value: 'blahblah'
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}