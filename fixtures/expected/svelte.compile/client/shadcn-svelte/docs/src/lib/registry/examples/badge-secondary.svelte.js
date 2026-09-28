import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Badge } from "$lib/registry/ui/badge/index.js";

export default function Badge_secondary($$anchor) {
	Badge($$anchor, {
		variant: 'secondary',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Secondary');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}