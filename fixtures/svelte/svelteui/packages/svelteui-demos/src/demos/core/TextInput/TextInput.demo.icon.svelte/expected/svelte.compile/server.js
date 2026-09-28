import * as $ from 'svelte/internal/server';
import { Center, TextInput } from '@svelteuidev/core';
import { EnvelopeClosed } from 'radix-icons-svelte';

const code = `
<script>
    import { TextInput } from '@svelteuidev/core';
    import { EnvelopeClosed } from 'radix-icons-svelte';
<\/script>

<TextInput
    label='Your email'
    placeholder='Your email'
    icon={EnvelopeClosed}
\/>
`;

export const type = 'demo';
export const configuration = { code };

export default function TextInput_demo_icon($$renderer) {
	Center($$renderer, {
		children: ($$renderer) => {
			TextInput($$renderer, {
				label: 'Your email',
				placeholder: 'Your email',
				icon: EnvelopeClosed
			});
		},
		$$slots: { default: true }
	});
}