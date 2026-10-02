import * as $ from 'svelte/internal/server';
import Badge from '$lib/components/ui/badge.svelte';

export default function Badge_01($$renderer) {
	Badge($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Badge`);
		},
		$$slots: { default: true }
	});
}