import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { A } from "flowbite-svelte";

export default function Default($$anchor) {
	A($$anchor, {
		class: 'font-medium hover:underline',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Read more');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}