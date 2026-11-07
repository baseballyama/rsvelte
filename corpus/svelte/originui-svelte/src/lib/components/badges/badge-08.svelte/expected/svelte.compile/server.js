import * as $ from 'svelte/internal/server';
import Badge from '$lib/components/ui/badge.svelte';

export default function Badge_08($$renderer) {
	Badge($$renderer, {
		variant: 'outline',
		class: 'gap-1.5',
		children: ($$renderer) => {
			$$renderer.push(`<span class="size-1.5 rounded-full bg-emerald-500" aria-hidden="true"></span> Badge`);
		},
		$$slots: { default: true }
	});
}