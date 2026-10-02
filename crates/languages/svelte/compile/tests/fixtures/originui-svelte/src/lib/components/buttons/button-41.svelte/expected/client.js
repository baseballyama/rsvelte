import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import StarIcon from '@lucide/svelte/icons/star';

var root = $.from_html(`<!> <span class="flex items-baseline gap-2">Star <span class="text-primary-foreground/60 text-xs">729</span></span>`, 1);

export default function Button_41($$anchor) {
	Button($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			StarIcon(node, { class: '-ms-1 opacity-60', size: 16, 'aria-hidden': 'true' });
			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}