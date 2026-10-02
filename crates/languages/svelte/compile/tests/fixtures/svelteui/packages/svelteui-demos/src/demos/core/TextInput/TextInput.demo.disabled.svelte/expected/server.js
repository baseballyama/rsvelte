import * as $ from 'svelte/internal/server';
import { Center, Stack, TextInput } from '@svelteuidev/core';

const code = `
<script>
    import { TextInput } from '@svelteuidev/core';
<\/script>

<TextInput disabled label='Disabled without value' placeholder='Your email' />
<TextInput disabled label='Disabled with value' value='you@email.com' />
`;

export const type = 'demo';
export const configuration = { code };

export default function TextInput_demo_disabled($$renderer) {
	Center($$renderer, {
		children: ($$renderer) => {
			Stack($$renderer, {
				position: 'center',
				children: ($$renderer) => {
					TextInput($$renderer, {
						disabled: true,
						label: 'Disabled without value',
						placeholder: 'Your email'
					});

					$$renderer.push(`<!----> `);

					TextInput($$renderer, {
						disabled: true,
						label: 'Disabled with value',
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