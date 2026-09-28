import * as $ from 'svelte/internal/server';
import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';

export default function TextTruncateControls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { position = 'end' } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Field($$renderer, {
				label: 'truncate position',
				classes: { container: 'w-fit' },
				children: ($$renderer) => {
					ToggleGroup($$renderer, {
						variant: 'outline',
						size: 'sm',
						inset: true,
						class: 'w-full',
						get value() {
							return position;
						},

						set value($$value) {
							position = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							ToggleOption($$renderer, {
								value: 'start',
								children: ($$renderer) => {
									$$renderer.push(`<!---->start`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: 'middle',
								children: ($$renderer) => {
									$$renderer.push(`<!---->middle`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: 'end',
								children: ($$renderer) => {
									$$renderer.push(`<!---->end`);
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { position });
	});
}