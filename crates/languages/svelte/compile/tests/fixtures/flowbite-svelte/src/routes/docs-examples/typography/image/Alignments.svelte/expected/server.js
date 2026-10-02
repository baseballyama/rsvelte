import * as $ from 'svelte/internal/server';
import { Img, img, Radio, Label } from "flowbite-svelte";

export default function Alignments($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const alignments = Object.keys(img.variants.align);
		let imgAlign = undefined;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex flex-col">`);

			Img($$renderer, {
				src: '/images/examples/image-1@2x.jpg',
				size: 'sm',
				align: imgAlign,
				alt: 'sample 1'
			});

			$$renderer.push(`<!----> <div class="mt-4 flex flex-wrap space-x-2">`);

			Label($$renderer, {
				class: 'mb-4 w-full font-bold',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Alignment`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <!--[-->`);

			const each_array = $.ensure_array_like(alignments);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let option = each_array[$$index];

				Radio($$renderer, {
					class: 'my-1',
					classes: { label: "w-16" },
					name: 'alignment',
					value: option,
					get group() {
						return imgAlign;
					},

					set group($$value) {
						imgAlign = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(option)}`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]--></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}