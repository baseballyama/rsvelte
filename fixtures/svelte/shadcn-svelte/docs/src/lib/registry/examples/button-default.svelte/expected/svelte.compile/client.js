import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/registry/ui/button/index.js";

export default function Button_default($$anchor) {
	Button($$anchor, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Button');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}