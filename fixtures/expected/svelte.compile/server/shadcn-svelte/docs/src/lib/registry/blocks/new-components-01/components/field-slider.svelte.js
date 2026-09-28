import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import { Slider } from "$lib/registry/ui/slider/index.js";

export default function Field_slider($$renderer) {
	let value = [200, 800];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="w-full max-w-md">`);

		if (Field.Field) {
			$$renderer.push('<!--[-->');

			Field.Field($$renderer, {
				children: ($$renderer) => {
					if (Field.Label) {
						$$renderer.push('<!--[-->');

						Field.Label($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Price Range`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Field.Description) {
						$$renderer.push('<!--[-->');

						Field.Description($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Set your budget range ($<span class="font-medium tabular-nums">${$.escape(value[0])}</span> - <span class="font-medium tabular-nums">${$.escape(value[1])}</span>).`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					Slider($$renderer, {
						type: 'multiple',
						max: 1000,
						min: 0,
						step: 10,
						class: 'mt-2 w-full',
						'aria-label': 'Price Range',
						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}