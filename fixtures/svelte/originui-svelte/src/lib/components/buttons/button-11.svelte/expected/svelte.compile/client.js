import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import ChevronDown from '@lucide/svelte/icons/chevron-down';

var root = $.from_html(`Button <!>`, 1);

export default function Button_11($$anchor) {
	Button($$anchor, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();
			var node = $.sibling($.first_child(fragment_1));

			ChevronDown(node, { class: '-me-1 opacity-60', size: 16, 'aria-hidden': 'true' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}