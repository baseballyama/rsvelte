import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';

export default function Button_01($$anchor) {
	Button($$anchor, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Button');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}