import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Img, img, Radio, Label } from "flowbite-svelte";

var root = $.from_html(`<div class="flex flex-col"><!> <div class="mt-4 flex flex-wrap space-x-2"><!> <!></div></div>`);

export default function Alignments($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	const alignments = Object.keys(img.variants.align);
	let imgAlign = $.state(undefined);
	var div = root();
	var node = $.child(div);

	Img(node, {
		src: '/images/examples/image-1@2x.jpg',
		size: 'sm',
		get align() {
			return $.get(imgAlign);
		},
		alt: 'sample 1'
	});

	var div_1 = $.sibling(node, 2);
	var node_1 = $.child(div_1);

	Label(node_1, {
		class: 'mb-4 w-full font-bold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Alignment');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	$.each(node_2, 17, () => alignments, $.index, ($$anchor, option) => {
		Radio($$anchor, {
			class: 'my-1',
			classes: { label: "w-16" },
			name: 'alignment',
			get value() {
				return $.get(option);
			},

			get group() {
				return $.get(imgAlign);
			},

			set group($$value) {
				$.set(imgAlign, $$value, true);
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

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}