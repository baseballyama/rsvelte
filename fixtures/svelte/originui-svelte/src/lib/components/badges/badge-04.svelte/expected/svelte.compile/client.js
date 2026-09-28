import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Badge from '$lib/components/ui/badge.svelte';

export default function Badge_04($$anchor) {
	Badge($$anchor, {
		class: 'min-w-5 px-1',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('6');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}