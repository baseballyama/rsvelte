import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/registry/ui/button/index.js";

export default function Button_secondary($$anchor) {
	Button($$anchor, {
		variant: 'secondary',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Secondary');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}