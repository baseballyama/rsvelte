import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Badge from '$lib/components/ui/badge.svelte';

export default function Badge_01($$anchor) {
	Badge($$anchor, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Badge');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}