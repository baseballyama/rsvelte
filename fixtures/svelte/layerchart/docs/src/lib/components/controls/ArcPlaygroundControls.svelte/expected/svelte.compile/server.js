import * as $ from 'svelte/internal/server';
import { Field, RangeField, Switch, TextField } from 'svelte-ux';
import ShowField from './fields/ShowField.svelte';

export default function ArcPlaygroundControls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			config = {
				show: false,
				value: 60,
				spring: true,
				domain: [0, 100],
				range: [-90, 90],
				innerRadius: 70,
				outerRadius: 140,
				cornerRadius: 8,
				padAngle: 0,
				outerText: 'outer text',
				innerText: 'inner text',
				centroidText: 'centroid text',
				textSize: 16
			}
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid grid-cols-[1fr_1fr_1fr_1fr] gap-2 mb-2 screenshot-hidden">`);

			RangeField($$renderer, {
				label: 'Value',
				min: config.domain[0],
				max: config.domain[1],
				class: 'col-span-2',
				get value() {
					return config.value;
				},

				set value($$value) {
					config.value = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			ShowField($$renderer, {
				inline: true,
				get show() {
					return config.show;
				},

				set show($$value) {
					config.show = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Field($$renderer, {
				label: 'Use spring',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { id }) => {
						Switch($$renderer, {
							id,
							get checked() {
								return config.spring;
							},

							set checked($$value) {
								config.spring = $$value;
								$$settled = false;
							}
						});
					}
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Domain Min',
				max: config.domain[1],
				get value() {
					return config.domain[0];
				},

				set value($$value) {
					config.domain[0] = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Domain Max',
				max: 1000,
				get value() {
					return config.domain[1];
				},

				set value($$value) {
					config.domain[1] = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Range Min (degrees)',
				min: -360,
				max: 360,
				get value() {
					return config.range[0];
				},

				set value($$value) {
					config.range[0] = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Range Max (degrees)',
				min: -360,
				max: 360,
				get value() {
					return config.range[1];
				},

				set value($$value) {
					config.range[1] = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Inner radius',
				max: config.outerRadius,
				get value() {
					return config.innerRadius;
				},

				set value($$value) {
					config.innerRadius = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Outer radius',
				min: config.innerRadius,
				max: 200,
				get value() {
					return config.outerRadius;
				},

				set value($$value) {
					config.outerRadius = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Corner radius',
				max: (config.outerRadius - config.innerRadius) / 2,
				get value() {
					return config.cornerRadius;
				},

				set value($$value) {
					config.cornerRadius = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Pad angle',
				max: 2,
				step: 0.1,
				get value() {
					return config.padAngle;
				},

				set value($$value) {
					config.padAngle = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			TextField($$renderer, {
				label: 'Outer Arc Text',
				get value() {
					return config.outerText;
				},

				set value($$value) {
					config.outerText = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			TextField($$renderer, {
				label: 'Inner Arc Text',
				get value() {
					return config.innerText;
				},

				set value($$value) {
					config.innerText = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			TextField($$renderer, {
				label: 'Centroid Arc Text',
				get value() {
					return config.centroidText;
				},

				set value($$value) {
					config.centroidText = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Font size (px)',
				min: config.domain[0],
				max: config.domain[1],
				get value() {
					return config.textSize;
				},

				set value($$value) {
					config.textSize = $$value;
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
		$.bind_props($$props, { config });
	});
}