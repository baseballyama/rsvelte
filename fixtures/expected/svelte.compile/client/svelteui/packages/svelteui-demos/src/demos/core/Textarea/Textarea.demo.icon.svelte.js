import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function Textarea_demo_icon($$anchor) {
	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Textarea($$anchor, {
				label: 'Message',
				placeholder: 'Dear John',
				get icon() {
					return EnvelopeClosed;
				}
			});
		},
		$$slots: { default: true }
	});
}