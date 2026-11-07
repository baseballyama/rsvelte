import * as $ from 'svelte/internal/server';
import { Field, RangeField, ToggleGroup, ToggleOption } from 'svelte-ux';

export default function GeoPointControls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { tooltipMode = void 0, tooltipRadius = void 0 } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex gap-2 screenshot-hidden">`);

			Field($$renderer, {
				label: 'Tooltip mode',
				class: 'grow',
				children: ($$renderer) => {
					ToggleGroup($$renderer, {
						variant: 'outline',
						get value() {
							return tooltipMode;
						},

						set value($$value) {
							tooltipMode = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							ToggleOption($$renderer, {
								value: 'quadtree',
								children: ($$renderer) => {
									$$renderer.push(`<!---->quadtree`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: 'voronoi',
								children: ($$renderer) => {
									$$renderer.push(`<!---->voronoi`);
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

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Tooltip radius',
				max: 100,
				class: 'grow',
				get value() {
					return tooltipRadius;
				},

				set value($$value) {
					tooltipRadius = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { tooltipMode, tooltipRadius });
	});
}