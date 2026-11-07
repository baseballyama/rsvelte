import * as $ from 'svelte/internal/server';
import { Center, Stack, TextInput } from '@svelteuidev/core';

const code = `
<script>
    import { TextInput } from '@svelteuidev/core';
<\/script>

<TextInput error label='Your email' value='you@email.com' \/>
<TextInput error='Invalid email' label='Your email' value='you@email.com' \/>
`;

export const type = 'demo';
export const configuration = { code };

export default function TextInput_demo_invalid($$renderer) {
	Center($$renderer, {
		children: ($$renderer) => {
			Stack($$renderer, {
				position: 'center',
				children: ($$renderer) => {
					TextInput($$renderer, { error: true, label: 'Your email', value: 'you@email.com' });
					$$renderer.push(`<!----> `);

					TextInput($$renderer, {
						error: 'Invalid email',
						label: 'Your email',
						value: 'you@email.com'
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}