import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Img, img, Radio, Label } from "flowbite-svelte";

var root = $.from_html(`<div class="flex flex-col items-center"><div class="md:h-[500px]"><!></div> <div class="mt-4 flex flex-wrap space-x-2"><!> <!></div></div>`);

export default function Sizes($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	const sizes = Object.keys(img.variants.size);
	let imgSize = $.state("md");
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Img(node, {
		src: '/images/examples/image-1@2x.jpg',
		get size() {
			return $.get(imgSize);
		},
		class: 'mx-auto',
		alt: 'sample 1'
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.child(div_2);

	Label(node_1, {
		class: 'mb-4 w-full font-bold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Size');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	$.each(node_2, 17, () => sizes, $.index, ($$anchor, option) => {
		Radio($$anchor, {
			class: 'my-1',
			classes: { label: "w-16" },
			name: 'img_size',
			get value() {
				return $.get(option);
			},

			get group() {
				return $.get(imgSize);
			},

			set group($$value) {
				$.set(imgSize, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_1 = $.text();

				$.template_effect(() => $.set_text(text_1, $.get(option)));
				$.append($$anchor, text_1);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}