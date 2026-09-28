import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function TextInput_demo_icon($$anchor) {
	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			TextInput($$anchor, {
				label: 'Your email',
				placeholder: 'Your email',
				get icon() {
					return EnvelopeClosed;
				}
			});
		},
		$$slots: { default: true }
	});
}