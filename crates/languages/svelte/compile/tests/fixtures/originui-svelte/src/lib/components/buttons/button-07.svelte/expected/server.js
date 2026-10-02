import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import Sparkles from '@lucide/svelte/icons/sparkles';

export default function Button_07($$renderer) {
	Button($$renderer, {
		variant: 'outline',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Button `);
			Sparkles($$renderer, { class: '-me-1 opacity-60', size: 16, 'aria-hidden': 'true' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}