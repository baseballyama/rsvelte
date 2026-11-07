import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import ChevronDown from '@lucide/svelte/icons/chevron-down';

export default function Button_11($$renderer) {
	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Button `);
			ChevronDown($$renderer, { class: '-me-1 opacity-60', size: 16, 'aria-hidden': 'true' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}