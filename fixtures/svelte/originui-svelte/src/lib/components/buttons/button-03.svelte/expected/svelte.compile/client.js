import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';

export default function Button_03($$anchor) {
	Button($$anchor, {
		class: 'rounded-full',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Button');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}