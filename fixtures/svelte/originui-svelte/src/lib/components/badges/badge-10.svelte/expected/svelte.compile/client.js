import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Badge from '$lib/components/ui/badge.svelte';

var root = $.from_html(`<span class="size-1.5 rounded-full bg-red-500" aria-hidden="true"></span> Badge`, 1);

export default function Badge_10($$anchor) {
	Badge($$anchor, {
		variant: 'outline',
		class: 'gap-1.5',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();

			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}