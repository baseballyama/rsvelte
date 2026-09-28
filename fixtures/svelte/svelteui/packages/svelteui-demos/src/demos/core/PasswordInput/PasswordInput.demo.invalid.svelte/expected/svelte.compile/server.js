import * as $ from 'svelte/internal/server';
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

export default function PasswordInput_demo_invalid($$renderer) {
	Center($$renderer, {
		children: ($$renderer) => {
			Stack($$renderer, {
				position: 'center',
				children: ($$renderer) => {
					PasswordInput($$renderer, { error: true, label: 'Password', value: 'blahblah' });
					$$renderer.push(`<!----> `);

					PasswordInput($$renderer, {
						error: 'Invalid password',
						label: 'Password',
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