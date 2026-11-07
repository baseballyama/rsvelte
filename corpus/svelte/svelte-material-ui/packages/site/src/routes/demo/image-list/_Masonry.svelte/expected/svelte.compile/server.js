import * as $ from 'svelte/internal/server';
import ImageList, { Item, Image, Supporting, Label } from '@smui/image-list';

export default function _Masonry($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function getUnevenImageSize(counter, base, variance, preAdd = (num) => num) {
			const mid = (counter % 2 ? Math.cos : Math.sin)(counter) * variance;

			return base + Math.floor(preAdd(mid));
		}

		ImageList($$renderer, {
			class: 'my-image-list-masonry',
			masonry: true,
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(Array(15));

				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let _unused = each_array[i];

					Item($$renderer, {
						children: ($$renderer) => {
							Image($$renderer, {
								src: `https://placehold.co/190x${$.stringify(getUnevenImageSize(i, 107, 200, Math.abs))}?text=190x${$.stringify(getUnevenImageSize(i, 107, 200, Math.abs))}`,
								alt: `Image ${$.stringify(i + 1)}`
							});

							$$renderer.push(`<!----> `);

							Supporting($$renderer, {
								children: ($$renderer) => {
									Label($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Image ${$.escape(i + 1)}`);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});
	});
}