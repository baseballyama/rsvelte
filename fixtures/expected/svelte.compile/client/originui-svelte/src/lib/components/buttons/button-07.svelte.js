import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import Sparkles from '@lucide/svelte/icons/sparkles';

var root = $.from_html(`Button <!>`, 1);

export default function Button_07($$anchor) {
	Button($$anchor, {
		variant: 'outline',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();
			var node = $.sibling($.first_child(fragment_1));

			Sparkles(node, { class: '-me-1 opacity-60', size: 16, 'aria-hidden': 'true' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}