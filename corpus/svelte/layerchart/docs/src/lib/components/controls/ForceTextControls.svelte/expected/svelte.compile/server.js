import * as $ from 'svelte/internal/server';
import { Field, RangeField, Switch, TextField } from 'svelte-ux';

export default function ForceTextControls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			config = {
				text: 'LayerChart',
				fontSize: 124,
				spacing: 10,
				radius: 2,
				hasCollideForce: true,
				hasChargeForce: false
			}
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid grid-flow-col gap-2 mb-1 screenshot-hidden">`);

			TextField($$renderer, {
				label: 'Text',
				get value() {
					return config.text;
				},

				set value($$value) {
					config.text = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Font size (px)',
				max: 600,
				get value() {
					return config.fontSize;
				},

				set value($$value) {
					config.fontSize = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Spacing',
				get value() {
					return config.spacing;
				},

				set value($$value) {
					config.spacing = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Radius',
				min: 1,
				max: config.spacing * 2,
				get value() {
					return config.radius;
				},

				set value($$value) {
					config.radius = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div class="flex gap-2 mb-2">`);

			Field($$renderer, {
				label: 'Collide Force',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { id }) => {
						Switch($$renderer, {
							id,
							size: 'md',
							get checked() {
								return config.hasCollideForce;
							},

							set checked($$value) {
								config.hasCollideForce = $$value;
								$$settled = false;
							}
						});
					}
				}
			});

			$$renderer.push(`<!----> `);

			Field($$renderer, {
				label: 'Charge Force',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { id }) => {
						Switch($$renderer, {
							id,
							size: 'md',
							get checked() {
								return config.hasChargeForce;
							},

							set checked($$value) {
								config.hasChargeForce = $$value;
								$$settled = false;
							}
						});
					}
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
		$.bind_props($$props, { config });
	});
}