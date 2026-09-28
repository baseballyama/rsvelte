import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Avatar } from '@skeletonlabs/skeleton-svelte';

var root = $.from_svg(`<!><!>`, 1);

var root_1 = $.from_svg(
	`<!><svg class="absolute -left-full w-0 h-0"><filter id="apollo" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feColorMatrix values="0.8 0.6 -0.4 0.1 0,
    0 1.2 0.05 0 0,
    0 -1 3 0.02 0,
    0 0 0 50 0" result="final" in="SourceGraphic"></feColorMatrix></filter></svg>`,
	1
);

export default function Filter($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	Avatar(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => Avatar.Image, ($$anchor, Avatar_Image) => {
				Avatar_Image($$anchor, {
					src: 'https://i.pravatar.cc/150?img=48',
					class: 'filter-[url(#apollo)]',
					alt: 'filtered'
				});
			});

			var node_2 = $.sibling(node_1);

			$.component(node_2, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
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

	$.next();
	$.append($$anchor, fragment);
}