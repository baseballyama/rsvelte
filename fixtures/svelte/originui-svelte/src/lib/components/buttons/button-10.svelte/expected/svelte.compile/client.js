import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import ArrowRight from '@lucide/svelte/icons/arrow-right';
import Mail from '@lucide/svelte/icons/mail';

var root = $.from_html(`<!> Button <!>`, 1);

export default function Button_10($$anchor) {
	Button($$anchor, {
		class: 'group',
		variant: 'secondary',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Mail(node, { class: '-ms-1 opacity-60', size: 16, 'aria-hidden': 'true' });

			var node_1 = $.sibling(node, 2);

			ArrowRight(node_1, {
				class: '-me-1 opacity-60 transition-transform group-hover:translate-x-0.5',
				size: 16,
				'aria-hidden': 'true'
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}