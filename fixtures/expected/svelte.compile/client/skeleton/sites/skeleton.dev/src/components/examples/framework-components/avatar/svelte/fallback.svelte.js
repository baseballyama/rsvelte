import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Avatar } from '@skeletonlabs/skeleton-svelte';

export default function Fallback($$anchor) {
	Avatar($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
				Avatar_Fallback($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('SK');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}