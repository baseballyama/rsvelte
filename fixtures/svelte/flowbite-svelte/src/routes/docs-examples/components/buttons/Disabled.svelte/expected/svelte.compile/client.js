import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "flowbite-svelte";

export default function Disabled($$anchor) {
	Button($$anchor, {
		disabled: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Disabled');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}