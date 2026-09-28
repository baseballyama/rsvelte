import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="max-w-4xl space-y-4"><!> <!></div>`);

export default function Advanced($$anchor) {
	let index = $.state(0);
	var div = root_1();
	var node = $.child(div);

	Carousel(node, {
		get images() {
			return images;
		},

		get index() {
			return $.get(index);
		},

		set index($$value) {
			$.set(index, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			{
				const children = ($$anchor, $$arg0) => {
					let selected = () => ($$arg0?.()).selected;
					let index = () => ($$arg0?.()).index;

					{
						let $0 = $.derived(() => selected() ? "red" : "green");
						let $1 = $.derived(() => selected() ? 'opacity-100' : 'opacity-80');

						Indicator($$anchor, {
							get color() {
								return $.get($0);
							},

							get class() {
								return `h-5 w-5 border border-white text-white ${$.get($1) ?? ''}`;
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(() => $.set_text(text, index()));
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					}
				};

				CarouselIndicators(node_1, { children, $$slots: { default: true } });
			}

			var node_2 = $.sibling(node_1, 2);

			{
				const children = ($$anchor, changeSlide = $.noop) => {
					var fragment_3 = root();
					var node_3 = $.first_child(fragment_3);

					ControlButton(node_3, {
						name: 'Previous',
						forward: false,
						onclick: () => changeSlide()(false)
					});

					var node_4 = $.sibling(node_3, 2);

					Button(node_4, {
						pill: true,
						class: 'absolute end-4 top-1/2 -translate-y-1/2 p-2 font-bold',
						onclick: () => changeSlide()(true),
						children: ($$anchor, $$slotProps) => {
							CaretRightOutline($$anchor, {});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				};

				Controls(node_2, { children, $$slots: { default: true } });
			}

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let image = () => ($$arg0?.()).image;
			let selected = () => ($$arg0?.()).selected;
			let Thumbnail = () => ($$arg0?.()).Thumbnail;
			var fragment_5 = $.comment();
			var node_6 = $.first_child(fragment_5);

			{
				let $0 = $.derived(() => selected() ? 'outline-primary-400 outline-4' : '');

				$.component(node_6, Thumbnail, ($$anchor, Thumbnail_1) => {
					Thumbnail_1($$anchor, $.spread_props(
						{
							get selected() {
								return selected();
							}
						},
						image,
						{
							get class() {
								return `hover:outline-primary-500 rounded-md shadow-xl hover:outline ${$.get($0) ?? ''}`;
							}
						}
					));
				});
			}

			$.append($$anchor, fragment_5);
		};

		Thumbnails(node_5, {
			class: 'mt-4 gap-3 bg-transparent',
			get images() {
				return images;
			},

			get index() {
				return $.get(index);
			},

			set index($$value) {
				$.set(index, $$value, true);
			},
			children,
			$$slots: { default: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);
}