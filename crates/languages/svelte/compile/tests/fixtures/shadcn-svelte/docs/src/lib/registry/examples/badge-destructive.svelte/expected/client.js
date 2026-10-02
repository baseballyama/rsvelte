import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Badge } from "$lib/registry/ui/badge/index.js";

export default function Badge_destructive($$anchor) {
	Badge($$anchor, {
		variant: 'destructive',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Destructive');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}