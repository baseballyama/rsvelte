import * as $ from 'svelte/internal/server';
import { Checkbox, Field, ProgressCircle, RangeField } from 'svelte-ux';

export default function ForceGraphPlaygroundControls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			config = {
				isStatic: false,
				isStopped: false,
				alphaTarget: 0,
				alpha: 1,
				running: false,
				nodeRadius: 3,
				nodeStrokeWidth: 0,
				linkWidth: 1,
				linkOpacity: 0.5,
				hasLinkForce: true,
				linkDistance: 30,
				hasCenterForce: true,
				centerStrength: 1.0,
				hasChargeForce: true,
				chargeDistanceMin: 1,
				chargeDistanceMax: 1000,
				chargeStrength: -30,
				hasCollideForce: true,
				collideRadius: 3,
				collideStrength: 1
			}
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid gap-1 mb-4 screenshot-hidden"><div class="grid grid-cols-7 gap-2">`);

			Field($$renderer, {
				label: 'Type',
				class: 'col-span-1',
				children: ($$renderer) => {
					Checkbox($$renderer, {
						size: 'xs',
						get checked() {
							return config.isStatic;
						},

						set checked($$value) {
							config.isStatic = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							$$renderer.push(`<!---->Static`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Field($$renderer, {
				label: 'State',
				class: 'col-span-1',
				children: ($$renderer) => {
					Checkbox($$renderer, {
						size: 'xs',
						get checked() {
							return config.isStopped;
						},

						set checked($$value) {
							config.isStopped = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							$$renderer.push(`<!---->Stopped`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Alpha Target',
				class: 'col-span-2',
				min: 0,
				max: 1,
				step: 0.1,
				get value() {
					return config.alphaTarget;
				},

				set value($$value) {
					config.alphaTarget = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Alpha',
				class: 'col-span-2',
				min: 0,
				max: 1,
				step: 0.001,
				format: 'decimal',
				get value() {
					return config.alpha;
				},

				set value($$value) {
					config.alpha = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Field($$renderer, {
				label: 'Running',
				class: 'col-span-1',
				children: ($$renderer) => {
					if (config.running) {
						$$renderer.push('<!--[0-->');
						ProgressCircle($$renderer, { size: 15 });
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="grid grid-cols-4 gap-2">`);

			RangeField($$renderer, {
				label: 'Node Radius',
				class: 'col-span-1',
				min: 3,
				max: 30,
				step: 1,
				get value() {
					return config.nodeRadius;
				},

				set value($$value) {
					config.nodeRadius = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Node Stroke Width',
				class: 'col-span-1',
				min: 0,
				max: 10,
				step: 0.5,
				get value() {
					return config.nodeStrokeWidth;
				},

				set value($$value) {
					config.nodeStrokeWidth = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Link Width',
				class: 'col-span-1',
				min: 1,
				max: 10,
				step: 0.5,
				get value() {
					return config.linkWidth;
				},

				set value($$value) {
					config.linkWidth = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Link Opacity',
				class: 'col-span-1',
				min: 0.1,
				max: 1,
				step: 0.1,
				get value() {
					return config.linkOpacity;
				},

				set value($$value) {
					config.linkOpacity = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div class="grid grid-cols-7 gap-2">`);

			Field($$renderer, {
				label: 'Link Force',
				class: 'col-span-1',
				children: ($$renderer) => {
					Checkbox($$renderer, {
						size: 'xs',
						get checked() {
							return config.hasLinkForce;
						},

						set checked($$value) {
							config.hasLinkForce = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Link Distance',
				class: 'col-span-3',
				min: 0,
				max: 100,
				step: 1,
				disabled: !config.hasLinkForce,
				get value() {
					return config.linkDistance;
				},

				set value($$value) {
					config.linkDistance = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Field($$renderer, {
				label: 'Center Force',
				class: 'col-span-1',
				children: ($$renderer) => {
					Checkbox($$renderer, {
						size: 'xs',
						get checked() {
							return config.hasCenterForce;
						},

						set checked($$value) {
							config.hasCenterForce = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Center Strength',
				class: 'col-span-2',
				min: 0,
				max: 1,
				step: 0.1,
				get value() {
					return config.centerStrength;
				},

				set value($$value) {
					config.centerStrength = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div class="grid grid-cols-7 gap-2">`);

			Field($$renderer, {
				label: 'Charge Force',
				class: 'col-span-1',
				children: ($$renderer) => {
					Checkbox($$renderer, {
						size: 'xs',
						get checked() {
							return config.hasChargeForce;
						},

						set checked($$value) {
							config.hasChargeForce = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Charge Distance Min',
				class: 'col-span-2',
				min: 1,
				max: 10,
				step: 1,
				disabled: !config.hasChargeForce,
				get value() {
					return config.chargeDistanceMin;
				},

				set value($$value) {
					config.chargeDistanceMin = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Charge Distance Max',
				class: 'col-span-2',
				min: 1,
				max: 1000,
				step: 10,
				disabled: !config.hasChargeForce,
				get value() {
					return config.chargeDistanceMax;
				},

				set value($$value) {
					config.chargeDistanceMax = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Charge Strength',
				class: 'col-span-2',
				min: -100,
				max: 10,
				step: 1,
				disabled: !config.hasChargeForce,
				get value() {
					return config.chargeStrength;
				},

				set value($$value) {
					config.chargeStrength = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div class="grid grid-cols-7 gap-2">`);

			Field($$renderer, {
				label: 'Collide Force',
				class: 'col-span-1',
				children: ($$renderer) => {
					Checkbox($$renderer, {
						size: 'xs',
						get checked() {
							return config.hasCollideForce;
						},

						set checked($$value) {
							config.hasCollideForce = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Collide Radius',
				class: 'col-span-3',
				min: 0,
				max: 30,
				step: 1,
				get value() {
					return config.collideRadius;
				},

				set value($$value) {
					config.collideRadius = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Collide Strength',
				class: 'col-span-3',
				min: 0,
				max: 1,
				step: 0.1,
				get value() {
					return config.collideStrength;
				},

				set value($$value) {
					config.collideStrength = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div></div>`);
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