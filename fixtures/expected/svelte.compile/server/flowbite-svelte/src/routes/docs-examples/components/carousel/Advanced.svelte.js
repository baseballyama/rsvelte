import * as $ from 'svelte/internal/server';

import {
	Button,
	Carousel,
	ControlButton,
	Controls,
	Indicator,
	CarouselIndicators,
	Thumbnails
} from "flowbite-svelte";

import { CaretRightOutline } from "flowbite-svelte-icons";
import images from "./imageData/images.json";

export default function Advanced($$renderer) {
	let index = 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="max-w-4xl space-y-4">`);

		Carousel($$renderer, {
			images,
			get index() {
				return index;
			},

			set index($$value) {
				index = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				{
					function children($$renderer, { selected, index }) {
						Indicator($$renderer, {
							color: selected ? "red" : "green",
							class: `h-5 w-5 border border-white text-white ${selected ? 'opacity-100' : 'opacity-80'}`,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(index)}`);
							},
							$$slots: { default: true }
						});
					}

					CarouselIndicators($$renderer, { children, $$slots: { default: true } });
				}

				$$renderer.push(`<!----> `);

				{
					function children($$renderer, changeSlide) {
						ControlButton($$renderer, {
							name: 'Previous',
							forward: false,
							onclick: () => changeSlide(false)
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							pill: true,
							class: 'absolute end-4 top-1/2 -translate-y-1/2 p-2 font-bold',
							onclick: () => changeSlide(true),
							children: ($$renderer) => {
								CaretRightOutline($$renderer, {});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					}

					Controls($$renderer, { children, $$slots: { default: true } });
				}

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		{
			function children($$renderer, { image, selected, Thumbnail }) {
				if (Thumbnail) {
					$$renderer.push('<!--[-->');

					Thumbnail($$renderer, $.spread_props([
						{ selected },
						image,
						{
							class: `hover:outline-primary-500 rounded-md shadow-xl hover:outline ${selected ? 'outline-primary-400 outline-4' : ''}`
						}
					]));

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			Thumbnails($$renderer, {
				class: 'mt-4 gap-3 bg-transparent',
				images,
				get index() {
					return index;
				},

				set index($$value) {
					index = $$value;
					$$settled = false;
				},
				children,
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}