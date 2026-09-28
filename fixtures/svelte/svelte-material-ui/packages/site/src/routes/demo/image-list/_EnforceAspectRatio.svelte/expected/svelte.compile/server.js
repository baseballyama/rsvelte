import * as $ from 'svelte/internal/server';
import ImageList, { Item, ImageAspectContainer, Image, Supporting, Label } from '@smui/image-list';

export default function _EnforceAspectRatio($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function getUnevenImageSize(counter, base, variance, preAdd = (num) => num) {
			const mid = (counter % 2 ? Math.cos : Math.sin)(counter) * variance;

			return base + Math.floor(preAdd(mid));
		}

		ImageList($$renderer, {
			class: 'my-image-list-enforce-ratio',
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(Array(15));

				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let _unused = each_array[i];

					Item($$renderer, {
						children: ($$renderer) => {
							ImageAspectContainer($$renderer, {
								children: ($$renderer) => {
									Image($$renderer, {
										tag: 'div',
										style: `background-image: url(https://placehold.co/190x${$.stringify(getUnevenImageSize(i, 190, 10))}?text=190x${$.stringify(getUnevenImageSize(i, 190, 10))});`
									});
								},
								$$slots: { default: true }
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