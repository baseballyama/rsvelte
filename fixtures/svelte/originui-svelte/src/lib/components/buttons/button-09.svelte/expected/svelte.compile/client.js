import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import ArrowRight from '@lucide/svelte/icons/arrow-right';

var root = $.from_html(`Button <!>`, 1);

export default function Button_09($$anchor) {
	Button($$anchor, {
		class: 'group',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();
			var node = $.sibling($.first_child(fragment_1));

			ArrowRight(node, {
				class: '-me-1 opacity-60 transition-transform group-hover:translate-x-0.5',
				size: 16,
				'aria-hidden': 'true'
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}