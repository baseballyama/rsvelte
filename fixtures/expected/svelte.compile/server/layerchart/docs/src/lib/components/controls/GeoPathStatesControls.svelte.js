import * as $ from 'svelte/internal/server';
import { SelectField } from 'svelte-ux';

export default function GeoPathStatesControls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			stateOptions,
			projections,
			selectedStateId = '54',
			projection = void 0
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid grid-cols-[1fr_1fr_1fr] gap-2 my-4 screenshot-hidden">`);

			SelectField($$renderer, {
				label: 'State',
				options: stateOptions,
				clearable: false,
				toggleIcon: null,
				stepper: true,
				get value() {
					return selectedStateId;
				},

				set value($$value) {
					selectedStateId = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			SelectField($$renderer, {
				label: 'Projections',
				options: projections,
				clearable: false,
				toggleIcon: null,
				stepper: true,
				get value() {
					return projection;
				},

				set value($$value) {
					projection = $$value;
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
		$.bind_props($$props, { selectedStateId, projection });
	});
}