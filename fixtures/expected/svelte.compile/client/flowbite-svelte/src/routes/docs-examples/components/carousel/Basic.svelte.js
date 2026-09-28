import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Carousel } from "flowbite-svelte";
import images from "./imageData/images.json";

var root = $.from_html(`<a target="_blank"><!></a>`);
var root_1 = $.from_html(`<div class="max-w-4xl space-y-4"><!></div>`);

export default function Basic($$anchor, $$props) {
	$.push($$props, true);

	var div = root_1();
	var node = $.child(div);

	{
		const slide = ($$anchor, $$arg0) => {
			let index = () => ($$arg0?.()).index;
			let Slide = () => ($$arg0?.()).Slide;
			var a = root();
			var node_1 = $.child(a);

			$.component(node_1, Slide, ($$anchor, Slide_1) => {
				Slide_1($$anchor, {
					get image() {
						return images[index()];
					}
				});
			});

			$.reset(a);
			$.template_effect(() => $.set_attribute(a, 'href', `http://google.com/search?q=${images[index()]?.title ?? ''}`));
			$.append($$anchor, a);
		};

		Carousel(node, {
			get images() {
				return images;
			},
			duration: 3900,
			slide,
			$$slots: { slide: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}