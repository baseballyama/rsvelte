import * as $ from 'svelte/internal/server';
import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';

export default function ForceSimulationControls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { groupBy = true } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex justify-end gap-2 items-end mb-2 screenshot-hidden">`);

			Field($$renderer, {
				labelPlacement: 'left',
				class: 'mb-1',
				dense: true,
				children: ($$renderer) => {
					ToggleGroup($$renderer, {
						size: 'sm',
						get value() {
							return groupBy;
						},

						set value($$value) {
							groupBy = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							ToggleOption($$renderer, {
								value: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Group`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: false,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Clump`);
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
		$.bind_props($$props, { groupBy });
	});
}