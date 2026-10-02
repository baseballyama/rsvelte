import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';

var root = $.from_html(`Previous <span class="bg-primary-foreground/15 pointer-events-none absolute inset-y-0 start-0 flex w-9 items-center justify-center"><!></span>`, 1);

export default function Button_38($$anchor) {
	Button($$anchor, {
		class: 'relative ps-12',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();
			var span = $.sibling($.first_child(fragment_1));
			var node = $.child(span);

			ChevronLeftIcon(node, { class: 'opacity-60', size: 16, 'aria-hidden': 'true' });
			$.reset(span);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}