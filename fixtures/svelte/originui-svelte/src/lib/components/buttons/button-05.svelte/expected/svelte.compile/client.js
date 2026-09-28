import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import Trash from '@lucide/svelte/icons/trash';

var root = $.from_html(`<!> Button`, 1);

export default function Button_05($$anchor) {
	Button($$anchor, {
		variant: 'destructive',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Trash(node, { class: '-ms-1 opacity-60', size: 16, 'aria-hidden': 'true' });
			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}