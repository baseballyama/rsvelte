import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Badge } from "$lib/registry/ui/badge/index.js";

export default function Badge_outline($$anchor) {
	Badge($$anchor, {
		variant: 'outline',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Outline');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}