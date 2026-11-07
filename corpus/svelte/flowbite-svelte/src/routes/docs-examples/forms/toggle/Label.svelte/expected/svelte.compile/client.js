import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toggle } from "flowbite-svelte";

export default function Label($$anchor) {
	{
		const offLabel = ($$anchor) => {
			$.next();

			var text = $.text('dark mode');

			$.append($$anchor, text);
		};

		Toggle($$anchor, {
			offLabel,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_1 = $.text('light mode');

				$.append($$anchor, text_1);
			},
			$$slots: { offLabel: true, default: true }
		});
	}
}