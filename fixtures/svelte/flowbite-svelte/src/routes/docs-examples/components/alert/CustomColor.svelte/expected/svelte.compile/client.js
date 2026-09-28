import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Alert } from "flowbite-svelte";

export default function CustomColor($$anchor) {
	Alert($$anchor, {
		class: 'bg-sky-500 text-white',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Your content');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}