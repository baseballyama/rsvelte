import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Badge } from "flowbite-svelte";

export default function Dynamic($$anchor) {
	setInterval(handleHover, 500);

	let color = $.state("primary");

	function handleHover() {
		$.set(color, $.get(color) === "primary" ? "secondary" : "primary", true);
	}

	Badge($$anchor, {
		large: true,
		get color() {
			return $.get(color);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Blinking badge');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}