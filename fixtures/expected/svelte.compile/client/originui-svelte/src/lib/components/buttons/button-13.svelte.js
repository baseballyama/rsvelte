import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import LoaderCircle from '@lucide/svelte/icons/loader-circle';

var root = $.from_html(`<!> Button`, 1);

export default function Button_13($$anchor) {
	Button($$anchor, {
		disabled: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			LoaderCircle(node, { class: '-ms-1 animate-spin', size: 16, 'aria-hidden': 'true' });
			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}