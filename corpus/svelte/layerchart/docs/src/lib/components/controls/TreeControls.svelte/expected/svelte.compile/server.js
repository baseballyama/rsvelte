import * as $ from 'svelte/internal/server';
import { Field, ToggleGroup, ToggleOption, RangeField, MenuField } from 'svelte-ux';
import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';

export default function TreeControls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { dataset = void 0, datasetOptions, config = void 0 } = $$props;
		const typeOptions = ['d3', 'straight', 'square', 'beveled', 'rounded', 'swoop'].map((type) => ({ label: type, value: type }));
		const sweepOptions = ['horizontal-vertical', 'vertical-horizontal', 'none'].map((sweep) => ({ label: sweep, value: sweep }));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div${$.attr_class('grid gap-2 screenshot-hidden', void 0, {
				'grid-cols-2': !datasetOptions,
				'grid-cols-3': datasetOptions
			})}>`);

			if (datasetOptions) {
				$$renderer.push('<!--[0-->');

				MenuField($$renderer, {
					label: 'Dataset',
					options: datasetOptions,
					stepper: true,
					classes: { menuIcon: 'hidden' },
					get value() {
						return dataset;
					},

					set value($$value) {
						dataset = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			Field($$renderer, {
				label: 'Orientation',
				children: ($$renderer) => {
					ToggleGroup($$renderer, {
						variant: 'outline',
						size: 'sm',
						inset: true,
						class: 'w-full',
						get value() {
							return config.orientation;
						},

						set value($$value) {
							config.orientation = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							ToggleOption($$renderer, {
								value: 'horizontal',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Horizontal`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: 'vertical',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Vertical`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: 'radial',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Radial`);
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

			Field($$renderer, {
				label: 'Layout',
				children: ($$renderer) => {
					ToggleGroup($$renderer, {
						variant: 'outline',
						size: 'sm',
						inset: true,
						class: 'w-full',
						get value() {
							return config.layout;
						},

						set value($$value) {
							config.layout = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							ToggleOption($$renderer, {
								value: 'chart',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Chart`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: 'node',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Node`);
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

			$$renderer.push(`<!----></div> <div class="grid grid-cols-3 gap-2 mt-2 mb-2 screenshot-hidden">`);

			MenuField($$renderer, {
				label: 'Link Type',
				options: typeOptions,
				stepper: true,
				classes: { menuIcon: 'hidden' },
				get value() {
					return config.type;
				},

				set value($$value) {
					config.type = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			if (config.type === 'd3') {
				$$renderer.push('<!--[0-->');

				CurveMenuField($$renderer, {
					get value() {
						return config.curve;
					},

					set value($$value) {
						config.curve = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (config.type === 'beveled' || config.type === 'rounded') {
				$$renderer.push('<!--[0-->');

				RangeField($$renderer, {
					label: 'Radius',
					min: 0,
					get value() {
						return config.radius;
					},

					set value($$value) {
						config.radius = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (config.type === 'swoop') {
				$$renderer.push('<!--[0-->');

				RangeField($$renderer, {
					label: 'Bend (°)',
					min: -90,
					max: 90,
					get value() {
						return config.bend;
					},

					set value($$value) {
						config.bend = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			MenuField($$renderer, {
				label: 'Link Sweep',
				options: sweepOptions,
				stepper: true,
				classes: { menuIcon: 'hidden' },
				get value() {
					return config.sweep;
				},

				set value($$value) {
					config.sweep = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div class="grid grid-cols-2 gap-2 mt-2 screenshot-hidden">`);

			RangeField($$renderer, {
				label: 'Parent Gap',
				min: 0,
				max: 300,
				disabled: config.layout !== 'node',
				get value() {
					return config.parentGap;
				},

				set value($$value) {
					config.parentGap = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			if (config.orientation === 'radial') {
				$$renderer.push('<!--[0-->');

				RangeField($$renderer, {
					label: 'Angular Spacing (°)',
					min: 5,
					max: 90,
					disabled: config.layout !== 'node',
					get value() {
						return config.angularSpacing;
					},

					set value($$value) {
						config.angularSpacing = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');

				RangeField($$renderer, {
					label: 'Sibling Gap',
					min: 0,
					max: 100,
					disabled: config.layout !== 'node',
					get value() {
						return config.siblingGap;
					},

					set value($$value) {
						config.siblingGap = $$value;
						$$settled = false;
					}
				});
			}

			$$renderer.push(`<!--]--></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { dataset, config });
	});
}