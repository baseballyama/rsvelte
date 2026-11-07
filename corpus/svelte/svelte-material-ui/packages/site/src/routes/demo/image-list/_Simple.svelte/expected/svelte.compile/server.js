import * as $ from 'svelte/internal/server';
import ImageList, { Item, ImageAspectContainer, Image, Supporting, Label } from '@smui/image-list';

export default function _Simple($$renderer) {
	ImageList($$renderer, {
		class: 'my-image-list-standard',
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
									src: 'https://placehold.co/190x190?text=square',
									alt: `Image ${$.stringify(i + 1)}`
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
}