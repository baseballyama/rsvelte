import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Img, img, Radio, Label } from "flowbite-svelte";

var root = $.from_html(`<div class="flex flex-col items-center"><!> <div class="mt-4 flex flex-wrap space-x-2"><!> <!></div></div>`);

export default function Effects($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	const effects = Object.keys(img.variants.effect);
	let imgEffect = $.state(undefined);
	var div = root();
	var node = $.child(div);

	Img(node, {
		src: '/images/examples/content-gallery-3.png',
		alt: 'sample 1',
		size: 'md',
		get effect() {
			return $.get(imgEffect);
		}
	});

	var div_1 = $.sibling(node, 2);
	var node_1 = $.child(div_1);

	Label(node_1, {
		class: 'mb-4 w-full font-bold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Effect');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	$.each(node_2, 17, () => effects, $.index, ($$anchor, effect) => {
		Radio($$anchor, {
			class: 'my-1',
			classes: { label: "w-24" },
			name: 'img_effect',
			get value() {
				return $.get(effect);
			},

			get group() {
				return $.get(imgEffect);
			},

			set group($$value) {
				$.set(imgEffect, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_1 = $.text();

				$.template_effect(() => $.set_text(text_1, $.get(effect)));
				$.append($$anchor, text_1);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}