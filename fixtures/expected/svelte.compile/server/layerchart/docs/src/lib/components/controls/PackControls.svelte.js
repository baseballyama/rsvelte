import * as $ from 'svelte/internal/server';
import { Field, RangeField, ToggleGroup, ToggleOption } from 'svelte-ux';

export default function PackControls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { padding = 0, colorBy = 'parent' } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid grid-cols-[2fr_1fr] gap-2 screenshot-hidden">`);

			RangeField($$renderer, {
				label: 'Padding',
				max: 50,
				get value() {
					return padding;
				},

				set value($$value) {
					padding = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Field($$renderer, {
				label: 'Color By',
				children: ($$renderer) => {
					ToggleGroup($$renderer, {
						variant: 'outline',
						size: 'sm',
						inset: true,
						class: 'w-full',
						get value() {
							return colorBy;
						},

						set value($$value) {
							colorBy = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							ToggleOption($$renderer, {
								value: 'parent',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Parent`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: 'depth',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Depth`);
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
		$.bind_props($$props, { padding, colorBy });
	});
}