import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Badge from '$lib/components/ui/badge.svelte';
import Check from '@lucide/svelte/icons/check';

var root = $.from_html(`<!> Badge`, 1);

export default function Badge_07($$anchor) {
	Badge($$anchor, {
		variant: 'outline',
		class: 'gap-1.5',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Check(node, { class: 'text-emerald-500', size: 12, 'aria-hidden': 'true' });
			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}