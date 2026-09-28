import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import Printer from '@lucide/svelte/icons/printer';

var root = $.from_html(`<!> Print <kbd class="bg-background text-muted-foreground/70 ms-1 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">⌘P</kbd>`, 1);

export default function Button_16($$anchor) {
	Button($$anchor, {
		variant: 'outline',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Printer(node, { class: '-ms-1 opacity-60', size: 16, 'aria-hidden': 'true' });
			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}