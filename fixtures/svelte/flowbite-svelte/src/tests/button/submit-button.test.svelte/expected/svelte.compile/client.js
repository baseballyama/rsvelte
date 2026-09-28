import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "$lib/buttons/Button.svelte";

export default function Submit_button_test($$anchor) {
	Button($$anchor, {
		type: 'submit',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Save');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}