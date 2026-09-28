import * as $ from 'svelte/internal/server';
import Badge from '$lib/components/ui/badge.svelte';

export default function Badge_04($$renderer) {
	Badge($$renderer, {
		class: 'min-w-5 px-1',
		children: ($$renderer) => {
			$$renderer.push(`<!---->6`);
		},
		$$slots: { default: true }
	});
}