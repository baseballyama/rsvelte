import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Badge from '$lib/components/ui/badge.svelte';
import Zap from '@lucide/svelte/icons/zap';

var root = $.from_html(`<!> Badge`, 1);

export default function Badge_03($$anchor) {
	Badge($$anchor, {
		class: 'gap-1',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Zap(node, { class: '-ms-0.5 opacity-60', size: 12, 'aria-hidden': 'true' });
			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}