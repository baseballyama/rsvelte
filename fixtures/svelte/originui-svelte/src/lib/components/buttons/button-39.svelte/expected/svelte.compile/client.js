import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';

var root = $.from_html(`Next <span class="bg-primary-foreground/15 pointer-events-none absolute inset-y-0 end-0 flex w-9 items-center justify-center"><!></span>`, 1);

export default function Button_39($$anchor) {
	Button($$anchor, {
		class: 'relative pe-12',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();
			var span = $.sibling($.first_child(fragment_1));
			var node = $.child(span);

			ChevronRightIcon(node, { class: 'opacity-60', size: 16, 'aria-hidden': 'true' });
			$.reset(span);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}