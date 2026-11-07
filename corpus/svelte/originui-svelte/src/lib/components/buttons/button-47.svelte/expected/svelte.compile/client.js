import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';

var root = $.from_html(`<!> Go back`, 1);

export default function Button_47($$anchor) {
	Button($$anchor, {
		variant: 'link',
		class: 'gap-1',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			ChevronLeftIcon(node, { class: 'opacity-60', size: 16, 'aria-hidden': 'true' });
			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}