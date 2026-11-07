import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';

var root = $.from_html(`Messages <span class="border-border text-muted-foreground -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">18</span>`, 1);

export default function Button_15($$anchor) {
	Button($$anchor, {
		variant: 'outline',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();

			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}