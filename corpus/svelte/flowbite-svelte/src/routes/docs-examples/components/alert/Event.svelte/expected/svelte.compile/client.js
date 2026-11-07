import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Alert } from "flowbite-svelte";

export default function Event($$anchor) {
	let alertStatus = $.state(true);

	const closeAlert = () => {
		alert("Clicked closeAlert.");
		$.set(alertStatus, !$.get(alertStatus));
	};

	Alert($$anchor, {
		dismissable: true,
		onclick: closeAlert,
		get alertStatus() {
			return $.get(alertStatus);
		},

		set alertStatus($$value) {
			$.set(alertStatus, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Close me');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}