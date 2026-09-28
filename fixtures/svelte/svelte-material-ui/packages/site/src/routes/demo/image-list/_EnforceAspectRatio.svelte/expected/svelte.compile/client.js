import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ImageList, { Item, ImageAspectContainer, Image, Supporting, Label } from '@smui/image-list';

var root = $.from_html(`<!> <!>`, 1);

export default function _EnforceAspectRatio($$anchor, $$props) {
	$.push($$props, true);

	function getUnevenImageSize(counter, base, variance, preAdd = (num) => num) {
		const mid = (counter % 2 ? Math.cos : Math.sin)(counter) * variance;

		return base + Math.floor(preAdd(mid));
	}

	ImageList($$anchor, {
		class: 'my-image-list-enforce-ratio',
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
								{
									let $0 = $.derived(() => getUnevenImageSize(i, 190, 10));
									let $1 = $.derived(() => getUnevenImageSize(i, 190, 10));

									Image($$anchor, {
										tag: 'div',
										get style() {
											return `background-image: url(https://placehold.co/190x${$.get($0) ?? ''}?text=190x${$.get($1) ?? ''});`;
										}
									});
								}
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

	$.pop();
}