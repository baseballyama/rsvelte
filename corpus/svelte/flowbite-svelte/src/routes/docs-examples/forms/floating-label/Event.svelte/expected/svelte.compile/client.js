import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { FloatingLabelInput } from "flowbite-svelte";

export default function Event($$anchor) {
	FloatingLabelInput($$anchor, {
		clearable: true,
		clearableOnClick: () => {
			alert("Clicked clear button");
		},
		variant: 'filled',
		id: 'event_filled',
		name: 'event_illed',
		type: 'text',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Floating filled');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}