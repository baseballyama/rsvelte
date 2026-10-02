import * as $ from 'svelte/internal/server';
import Badge from '$lib/components/ui/badge.svelte';

export default function Badge_02($$renderer) {
	Badge($$renderer, {
		class: 'rounded',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Badge`);
		},
		$$slots: { default: true }
	});
}