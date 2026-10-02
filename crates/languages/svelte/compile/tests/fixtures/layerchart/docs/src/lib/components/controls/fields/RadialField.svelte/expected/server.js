import * as $ from 'svelte/internal/server';
import { curveCatmullRomClosed, curveLinearClosed } from 'd3-shape';
import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';

export default function RadialField($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { curve = curveLinearClosed } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="screenshot-hidden">`);

			Field($$renderer, {
				label: 'curve: ',
				labelPlacement: 'left',
				dense: true,
				class: 'absolute top-2 right-2 z-1',
				children: ($$renderer) => {
					ToggleGroup($$renderer, {
						size: 'sm',
						get value() {
							return curve;
						},

						set value($$value) {
							curve = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							ToggleOption($$renderer, {
								value: curveLinearClosed,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Linear`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: curveCatmullRomClosed,
								children: ($$renderer) => {
									$$renderer.push(`<!---->CatmullRom`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { curve });
	});
}