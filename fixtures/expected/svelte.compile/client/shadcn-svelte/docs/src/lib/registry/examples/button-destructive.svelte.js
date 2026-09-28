import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/registry/ui/button/index.js";

export default function Button_destructive($$anchor) {
	Button($$anchor, {
		variant: 'destructive',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Destructive');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}