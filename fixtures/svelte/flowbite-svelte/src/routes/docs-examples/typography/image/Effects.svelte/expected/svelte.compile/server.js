import * as $ from 'svelte/internal/server';
import { Img, img, Radio, Label } from "flowbite-svelte";

export default function Effects($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const effects = Object.keys(img.variants.effect);
		let imgEffect = undefined;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex flex-col items-center">`);

			Img($$renderer, {
				src: '/images/examples/content-gallery-3.png',
				alt: 'sample 1',
				size: 'md',
				effect: imgEffect
			});

			$$renderer.push(`<!----> <div class="mt-4 flex flex-wrap space-x-2">`);

			Label($$renderer, {
				class: 'mb-4 w-full font-bold',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Effect`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <!--[-->`);

			const each_array = $.ensure_array_like(effects);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let effect = each_array[$$index];

				Radio($$renderer, {
					class: 'my-1',
					classes: { label: "w-24" },
					name: 'img_effect',
					value: effect,
					get group() {
						return imgEffect;
					},

					set group($$value) {
						imgEffect = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(effect)}`);
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