import * as $ from 'svelte/internal/server';
import BlocksIcon from '@lucide/svelte/icons/blocks';
import LayoutTemplateIcon from '@lucide/svelte/icons/layout-template';
import PaletteIcon from '@lucide/svelte/icons/palette';
import SparklesIcon from '@lucide/svelte/icons/sparkles';
import WandIcon from '@lucide/svelte/icons/wand-2';
import { Carousel } from '@skeletonlabs/skeleton-svelte';

export default function Auth_carousel($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const slides = [
			{
				Icon: PaletteIcon,
				title: 'The design layer for Skeleton.',
				description: 'Themes, presets, mesh gradients, UI blocks, and templates — everything you need to ship a beautiful Skeleton app.'
			},

			{
				Icon: WandIcon,
				title: 'Presets for every surface.',
				description: 'A curated library of presets keeps spacing, color, and typography consistent across every screen you build.'
			},

			{
				Icon: SparklesIcon,
				title: 'Mesh gradients on demand.',
				description: 'Generate vibrant, customizable mesh gradients to add depth and atmosphere to any layout in seconds.'
			},

			{
				Icon: BlocksIcon,
				title: 'Production-ready UI blocks.',
				description: 'Drop in headers, heroes, pricing sections, and more — assembled from Skeleton primitives and ready to ship.'
			},

			{
				Icon: LayoutTemplateIcon,
				title: 'Full app templates.',
				description: 'Kickstart your next project with complete templates — fully themed, responsive, and styled with Skeleton.'
			}
		];

		Carousel($$renderer, {
			slideCount: slides.length,
			slidesPerPage: 1,
			loop: true,
			autoplay: true,
			children: ($$renderer) => {
				if (Carousel.ItemGroup) {
					$$renderer.push('<!--[-->');

					Carousel.ItemGroup($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array = $.ensure_array_like(slides);

							for (let i = 0, $$length = each_array.length; i < $$length; i++) {
								let slide = each_array[i];

								if (Carousel.Item) {
									$$renderer.push('<!--[-->');

									Carousel.Item($$renderer, {
										index: i,
										class: 'space-y-4 p-4 flex flex-col items-start',
										children: ($$renderer) => {
											$$renderer.push(`<div class="preset-filled-primary-500 inline-flex items-center justify-center p-3 rounded-lg">`);

											if (slide.Icon) {
												$$renderer.push('<!--[-->');
												slide.Icon($$renderer, { class: 'size-6' });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(`</div> <h2 class="h3">${$.escape(slide.title)}</h2> <p class="opacity-60">${$.escape(slide.description)}</p>`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Carousel.IndicatorGroup) {
					$$renderer.push('<!--[-->');

					Carousel.IndicatorGroup($$renderer, {
						children: ($$renderer) => {
							{
								function children($$renderer, carousel) {
									$$renderer.push(`<!--[-->`);

									const each_array_1 = $.ensure_array_like(carousel().pageSnapPoints);

									for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
										let _ = each_array_1[index];

										if (Carousel.Indicator) {
											$$renderer.push('<!--[-->');
											Carousel.Indicator($$renderer, { index });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									}

									$$renderer.push(`<!--]-->`);
								}

								if (Carousel.Context) {
									$$renderer.push('<!--[-->');
									Carousel.Context($$renderer, { children, $$slots: { default: true } });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							}
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});
	});
}