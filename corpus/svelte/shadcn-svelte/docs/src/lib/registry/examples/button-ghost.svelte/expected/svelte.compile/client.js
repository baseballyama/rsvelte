import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/registry/ui/button/index.js";

export default function Button_ghost($$anchor) {
	Button($$anchor, {
		variant: 'ghost',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Ghost');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}