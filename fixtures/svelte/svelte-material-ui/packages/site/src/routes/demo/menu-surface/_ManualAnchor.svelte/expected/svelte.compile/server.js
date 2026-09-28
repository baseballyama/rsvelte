import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import MenuSurface, { Anchor } from '@smui/menu-surface';
import ImageList, { Item as ImageListItem, ImageAspectContainer, Image } from '@smui/image-list';
import Button from '@smui/button';

export default function _ManualAnchor($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let surface;
		let anchor = void 0;
		let anchorClasses = {};

		onMount(() => {
			// This sets the menu surface's origin corner to the top end instead of the
			// top start.
			surface.flipCornerHorizontally();
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div${$.attr_class($.clsx(Object.keys(anchorClasses).join(' ')))} style="display: inline-block;">`);

			Button($$renderer, {
				onclick: () => surface.setOpen(true),
				children: ($$renderer) => {
					$$renderer.push(`<!---->Open Menu Surface`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			MenuSurface($$renderer, {
				anchor: false,
				get anchorElement() {
					return anchor;
				},

				set anchorElement($$value) {
					anchor = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					ImageList($$renderer, {
						class: 'menu-surface-image-list',
						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array = $.ensure_array_like(Array(4));

							for (let i = 0, $$length = each_array.length; i < $$length; i++) {
								let _unused = each_array[i];

								ImageListItem($$renderer, {
									children: ($$renderer) => {
										ImageAspectContainer($$renderer, {
											children: ($$renderer) => {
												Image($$renderer, {
													src: `https://placehold.co/100x100?text=Image%20${$.stringify(i + 1)}`,
													alt: `Image ${$.stringify(i + 1)}`
												});
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}