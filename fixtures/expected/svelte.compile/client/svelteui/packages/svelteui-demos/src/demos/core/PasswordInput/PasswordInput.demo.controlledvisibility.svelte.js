import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Center, PasswordInput } from '@svelteuidev/core';

const code = `
<script>
  import { Center, PasswordInput } from '@svelteuidev/core';
	import { EnvelopeClosed, EnvelopeOpen } from 'radix-icons-svelte';

	let show = false;

	const onVisibilityChange = (visible) => {
		show = visible;
	};
<\/script>

<PasswordInput label="Your password" visible={show} {onVisibilityChange} />
`;

export const type = 'demo';
export const configuration = { code };

export default function PasswordInput_demo_controlledvisibility($$anchor) {
	let show = false;

	const onVisibilityChange = (visible) => {
		show = visible;
	};

	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			PasswordInput($$anchor, {
				label: 'Your password',
				get visible() {
					return show;
				},
				onVisibilityChange
			});
		},
		$$slots: { default: true }
	});
}