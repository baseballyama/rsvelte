import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';

var root = $.from_html(`<!> <!>`, 1);

export default function Avatar_01($$anchor) {
	Avatar($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			AvatarImage(node, { src: '/avatar-80-07.jpg', alt: 'Kelly King' });

			var node_1 = $.sibling(node, 2);

			AvatarFallback(node_1, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('CN');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}