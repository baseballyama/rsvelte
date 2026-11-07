import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import Plus from '@lucide/svelte/icons/plus';

var root = $.from_html(`<!> <span class="max-sm:sr-only">Add new</span>`, 1);

export default function Button_19($$anchor) {
	Button($$anchor, {
		variant: 'outline',
		class: 'aspect-square max-sm:p-0',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Plus(node, {
				class: 'opacity-60 sm:-ms-1',
				size: 16,
				'aria-hidden': 'true'
			});

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}