import * as $ from 'svelte/internal/server';
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

export default function PasswordInput_demo_controlledvisibility($$renderer) {
	let show = false;

	const onVisibilityChange = (visible) => {
		show = visible;
	};

	Center($$renderer, {
		children: ($$renderer) => {
			PasswordInput($$renderer, { label: 'Your password', visible: show, onVisibilityChange });
		},
		$$slots: { default: true }
	});
}