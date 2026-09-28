import * as $ from 'svelte/internal/server';
import Badge from '$lib/components/ui/badge.svelte';

export default function Badge_06($$renderer) {
	Badge($$renderer, {
		class: 'items-baseline gap-1.5',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Badge <span class="text-primary-foreground/60 text-[0.625rem] font-medium">73</span>`);
		},
		$$slots: { default: true }
	});
}