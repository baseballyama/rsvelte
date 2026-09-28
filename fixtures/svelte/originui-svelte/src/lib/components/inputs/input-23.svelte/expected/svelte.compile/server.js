import * as $ from 'svelte/internal/server';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import Eye from '@lucide/svelte/icons/eye';
import EyeOff from '@lucide/svelte/icons/eye-off';

export default function Input_23($$renderer) {
	const uid = $.props_id($$renderer);
	let isVisible = false;

	function toggleVisibility() {
		isVisible = !isVisible;
	}

	$$renderer.push(`<div class="*:not-first:mt-2">`);

	Label($$renderer, {
		for: uid,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Show/hide password input`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="relative">`);

	Input($$renderer, {
		id: uid,
		class: 'pe-9',
		placeholder: 'Password',
		type: isVisible ? 'text' : 'password'
	});

	$$renderer.push(`<!----> <button class="text-muted-foreground/80 ring-offset-background hover:text-foreground focus-visible:border-ring focus-visible:text-foreground focus-visible:ring-ring/30 absolute inset-y-px end-px flex h-full w-9 items-center justify-center rounded-e-lg transition-shadow focus-visible:border focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50" type="button"${$.attr('aria-label', isVisible ? 'Hide password' : 'Show password')}${$.attr('aria-pressed', isVisible)}${$.attr('aria-controls', uid)}>`);

	if (isVisible) {
		$$renderer.push('<!--[0-->');
		EyeOff($$renderer, { size: 16, 'aria-hidden': 'true' });
	} else {
		$$renderer.push('<!--[-1-->');
		Eye($$renderer, { size: 16, 'aria-hidden': 'true' });
	}

	$$renderer.push(`<!--]--></button></div></div>`);
}