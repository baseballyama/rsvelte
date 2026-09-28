import * as $ from 'svelte/internal/server';
import Badge from '$lib/components/ui/badge.svelte';
import Zap from '@lucide/svelte/icons/zap';

export default function Badge_03($$renderer) {
	Badge($$renderer, {
		class: 'gap-1',
		children: ($$renderer) => {
			Zap($$renderer, { class: '-ms-0.5 opacity-60', size: 12, 'aria-hidden': 'true' });
			$$renderer.push(`<!----> Badge`);
		},
		$$slots: { default: true }
	});
}