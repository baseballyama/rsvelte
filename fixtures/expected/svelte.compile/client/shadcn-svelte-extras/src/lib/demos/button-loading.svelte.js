import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/button.svelte';

export default function Button_loading($$anchor) {
	Button($$anchor, {
		loading: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Save');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}