import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Badge } from "flowbite-svelte";

export default function Dismissable3($$anchor) {
	function handleClose(event) {
		event.preventDefault();
		alert("Badge dismissed");
	}

	Badge($$anchor, {
		dismissable: true,
		large: true,
		onclose: handleClose,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Default');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}