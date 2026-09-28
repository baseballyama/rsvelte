import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toast } from "flowbite-svelte";

export default function Events($$anchor) {
	Toast($$anchor, {
		onclick: () => alert("Toast clicked"),
		onclose: () => alert("Toast closing"),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Click this toast or the close button to trigger an event.');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}