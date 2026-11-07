import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ImageList, { Item, Image, Supporting, Label } from '@smui/image-list';

var root = $.from_html(`<!> <!>`, 1);

export default function _Masonry($$anchor, $$props) {
	$.push($$props, true);

	function getUnevenImageSize(counter, base, variance, preAdd = (num) => num) {
		const mid = (counter % 2 ? Math.cos : Math.sin)(counter) * variance;

		return base + Math.floor(preAdd(mid));
	}

	ImageList($$anchor, {
		class: 'my-image-list-masonry',
		masonry: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 16, () => Array(15), $.index, ($$anchor, _unused, i) => {
				Item($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root();
						var node_1 = $.first_child(fragment_3);

						{
							let $0 = $.derived(() => getUnevenImageSize(i, 107, 200, Math.abs));
							let $1 = $.derived(() => getUnevenImageSize(i, 107, 200, Math.abs));

							Image(node_1, {
								get src() {
									return `https://placehold.co/190x${$.get($0) ?? ''}?text=190x${$.get($1) ?? ''}`;
								},
								alt: `Image ${i + 1}`
							});
						}

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