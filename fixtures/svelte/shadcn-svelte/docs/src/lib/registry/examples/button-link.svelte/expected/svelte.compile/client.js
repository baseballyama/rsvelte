import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/registry/ui/button/index.js";

export default function Button_link($$anchor) {
	Button($$anchor, {
		variant: 'link',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Link');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}