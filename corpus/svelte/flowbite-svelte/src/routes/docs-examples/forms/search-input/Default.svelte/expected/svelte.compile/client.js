import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Search, Button } from "flowbite-svelte";

export default function Default($$anchor) {
	Search($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Button($$anchor, {
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