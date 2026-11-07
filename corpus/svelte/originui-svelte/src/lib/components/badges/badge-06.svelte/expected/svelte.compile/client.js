import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Badge from '$lib/components/ui/badge.svelte';

var root = $.from_html(`Badge <span class="text-primary-foreground/60 text-[0.625rem] font-medium">73</span>`, 1);

export default function Badge_06($$anchor) {
	Badge($$anchor, {
		class: 'items-baseline gap-1.5',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();

			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}