import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Avatar } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor) {
	Avatar($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.component(node, () => Avatar.Image, ($$anchor, Avatar_Image) => {
				Avatar_Image($$anchor, { src: 'https://picsum.photos/100/100' });
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
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