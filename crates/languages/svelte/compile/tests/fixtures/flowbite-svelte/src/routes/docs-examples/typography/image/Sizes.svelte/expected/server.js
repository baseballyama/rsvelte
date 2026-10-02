import * as $ from 'svelte/internal/server';
import { Img, img, Radio, Label } from "flowbite-svelte";

export default function Sizes($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const sizes = Object.keys(img.variants.size);
		let imgSize = "md";
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex flex-col items-center"><div class="md:h-[500px]">`);

			Img($$renderer, {
				src: '/images/examples/image-1@2x.jpg',
				size: imgSize,
				class: 'mx-auto',
				alt: 'sample 1'
			});

			$$renderer.push(`<!----></div> <div class="mt-4 flex flex-wrap space-x-2">`);

			Label($$renderer, {
				class: 'mb-4 w-full font-bold',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Size`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <!--[-->`);

			const each_array = $.ensure_array_like(sizes);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let option = each_array[$$index];

				Radio($$renderer, {
					class: 'my-1',
					classes: { label: "w-16" },
					name: 'img_size',
					value: option,
					get group() {
						return imgSize;
					},

					set group($$value) {
						imgSize = $$value;
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