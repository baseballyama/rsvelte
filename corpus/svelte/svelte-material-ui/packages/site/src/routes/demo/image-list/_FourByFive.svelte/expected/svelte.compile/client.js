import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ImageList, { Item, ImageAspectContainer, Image, Supporting, Label } from '@smui/image-list';

var root = $.from_html(`<!> <!>`, 1);

export default function _FourByFive($$anchor) {
	ImageList($$anchor, {
		class: 'my-image-list-4x5',
		withTextProtection: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 16, () => Array(15), $.index, ($$anchor, _unused, i) => {
				Item($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root();
						var node_1 = $.first_child(fragment_3);

						ImageAspectContainer(node_1, {
							children: ($$anchor, $$slotProps) => {
								Image($$anchor, {
									src: 'https://placehold.co/190x238?text=4x5',
									alt: `Image ${i + 1}`
								});
							},
							$$slots: { default: true }
						});

						var node_2 = $.sibling(node_1, 2);

						Supporting(node_2, {
							children: ($$anchor, $$slotProps) => {
								Label($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text();

										text.nodeValue = `Image ${i + 1}`;
										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}