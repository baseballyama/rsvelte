import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Avatar } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex items-center gap-8"><!> <!> <!></div>`);

export default function Default($$anchor) {
	var div = root_1();
	var node = $.child(div);

	Avatar(node, {
		class: 'size-10',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => Avatar.Image, ($$anchor, Avatar_Image) => {
				Avatar_Image($$anchor, { src: 'https://i.pravatar.cc/40?img=48', alt: 'small' });
			});

			var node_2 = $.sibling(node_1, 2);

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

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 2);

	Avatar(node_3, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_4 = $.first_child(fragment_1);

			$.component(node_4, () => Avatar.Image, ($$anchor, Avatar_Image_1) => {
				Avatar_Image_1($$anchor, { src: 'https://i.pravatar.cc/60?img=48', alt: 'base' });
			});

			var node_5 = $.sibling(node_4, 2);

			$.component(node_5, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_1) => {
				Avatar_Fallback_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('SK');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_3, 2);

	Avatar(node_6, {
		class: 'size-20',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();
			var node_7 = $.first_child(fragment_2);

			$.component(node_7, () => Avatar.Image, ($$anchor, Avatar_Image_2) => {
				Avatar_Image_2($$anchor, { src: 'https://i.pravatar.cc/80?img=48', alt: 'large' });
			});

			var node_8 = $.sibling(node_7, 2);

			$.component(node_8, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_2) => {
				Avatar_Fallback_2($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('SK');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}