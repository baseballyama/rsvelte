import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/registry/ui/button/index.js";

export default function Button_outline($$anchor) {
	Button($$anchor, {
		variant: 'outline',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Outline');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}