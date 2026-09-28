import * as $ from 'svelte/internal/server';
import { Center, Textarea } from '@svelteuidev/core';
import { EnvelopeClosed } from 'radix-icons-svelte';

const code = `
<script>
  import { Textarea } from '@svelteuidev/core';
  import { EnvelopeClosed } from 'radix-icons-svelte';
<\/script>

<Textarea label="Message" placeholder="Dear John" icon={EnvelopeClosed} />
`;

export const type = 'demo';
export const configuration = { code };

export default function Textarea_demo_icon($$renderer) {
	Center($$renderer, {
		children: ($$renderer) => {
			Textarea($$renderer, {
				label: 'Message',
				placeholder: 'Dear John',
				icon: EnvelopeClosed
			});
		},
		$$slots: { default: true }
	});
}