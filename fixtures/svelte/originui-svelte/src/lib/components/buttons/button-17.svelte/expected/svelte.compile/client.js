import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';

var root = $.from_html(`<div class="me-0.5 flex aspect-square h-full p-1.5"><enhanced:img class="size-[24px] rounded-full" src="/static/avatar.jpg" alt="Profile image" aria-hidden="true" loading="lazy"></enhanced:img></div> @max_gotts`, 1);

export default function Button_17($$anchor) {
	Button($$anchor, {
		class: 'rounded-full py-0 ps-0',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();

			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}