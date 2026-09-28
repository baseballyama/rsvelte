import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import ArrowLeft from '@lucide/svelte/icons/arrow-left';

var root = $.from_html(`<!> Button`, 1);

export default function Button_08($$anchor) {
	Button($$anchor, {
		variant: 'outline',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			ArrowLeft(node, {
				class: '-ms-1 opacity-60 transition-transform group-hover:-translate-x-0.5',
				size: 16,
				'aria-hidden': 'true'
			});

			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}