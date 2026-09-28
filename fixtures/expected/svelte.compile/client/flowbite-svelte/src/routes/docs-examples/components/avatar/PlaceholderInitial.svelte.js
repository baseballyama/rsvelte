import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Avatar } from "flowbite-svelte";

export default function PlaceholderInitial($$anchor) {
	Avatar($$anchor, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('JL');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}