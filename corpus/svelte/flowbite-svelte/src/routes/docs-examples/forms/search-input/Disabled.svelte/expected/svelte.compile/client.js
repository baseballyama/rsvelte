import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Search, Button } from "flowbite-svelte";

export default function Disabled($$anchor) {
	Search($$anchor, {
		disabled: true,
		children: ($$anchor, $$slotProps) => {
			Button($$anchor, {
				disabled: true,
				class: 'me-1',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Search');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}