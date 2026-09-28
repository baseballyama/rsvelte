import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "$lib/buttons/Button.svelte";

export default function Label_button_test($$anchor) {
	Button($$anchor, {
		tag: 'label',
		'data-testid': 'label',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Test');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}