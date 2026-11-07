import * as $ from 'svelte/internal/server';
import Badge from '$lib/components/ui/badge.svelte';
import Check from '@lucide/svelte/icons/check';

export default function Badge_07($$renderer) {
	Badge($$renderer, {
		variant: 'outline',
		class: 'gap-1.5',
		children: ($$renderer) => {
			Check($$renderer, { class: 'text-emerald-500', size: 12, 'aria-hidden': 'true' });
			$$renderer.push(`<!----> Badge`);
		},
		$$slots: { default: true }
	});
}