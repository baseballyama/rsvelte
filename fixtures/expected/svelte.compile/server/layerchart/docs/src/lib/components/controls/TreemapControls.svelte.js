import * as $ from 'svelte/internal/server';
import { Field, RangeField, Switch, ToggleGroup, ToggleOption } from 'svelte-ux';

export default function TreemapControls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			config = {
				tile: 'squarify',
				colorBy: 'children',
				maintainAspectRatio: false,
				paddingOuter: 4,
				paddingInner: 4,
				paddingTop: 20,
				paddingBottom: 0,
				paddingLeft: 0,
				paddingRight: 0,
				isFiltered: undefined
			}
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid gap-2 mb-2 screenshot-hidden"><div class="grid grid-cols-[6fr_1fr_3fr] gap-2">`);

			Field($$renderer, {
				label: 'Tile',
				children: ($$renderer) => {
					ToggleGroup($$renderer, {
						variant: 'outline',
						size: 'sm',
						inset: true,
						class: 'w-full',
						get value() {
							return config.tile;
						},

						set value($$value) {
							config.tile = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							ToggleOption($$renderer, {
								value: 'squarify',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Squarify`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: 'resquarify',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Resquarify`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: 'binary',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Binary`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: 'slice',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Slice`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: 'dice',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Dice`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: 'sliceDice',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Slice / Dice`);
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
				label: 'Maintain Aspect Ratio',
				children: ($$renderer) => {
					ToggleGroup($$renderer, {
						variant: 'outline',
						size: 'sm',
						inset: true,
						class: 'w-full',
						get value() {
							return config.maintainAspectRatio;
						},

						set value($$value) {
							config.maintainAspectRatio = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							ToggleOption($$renderer, {
								value: false,
								children: ($$renderer) => {
									$$renderer.push(`<!---->No`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Yes`);
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
				label: 'Color By',
				children: ($$renderer) => {
					ToggleGroup($$renderer, {
						variant: 'outline',
						size: 'sm',
						inset: true,
						class: 'w-full',
						get value() {
							return config.colorBy;
						},

						set value($$value) {
							config.colorBy = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							ToggleOption($$renderer, {
								value: 'children',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Children`);
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

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: 'parent',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Parent`);
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

			$$renderer.push(`<!----></div> <div class="grid grid-cols-2 gap-2">`);

			RangeField($$renderer, {
				label: 'Padding Outer',
				get value() {
					return config.paddingOuter;
				},

				set value($$value) {
					config.paddingOuter = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Padding Inner',
				get value() {
					return config.paddingInner;
				},

				set value($$value) {
					config.paddingInner = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div class="grid grid-cols-4 gap-2">`);

			RangeField($$renderer, {
				label: 'Padding Top',
				get value() {
					return config.paddingTop;
				},

				set value($$value) {
					config.paddingTop = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Padding Bottom',
				get value() {
					return config.paddingBottom;
				},

				set value($$value) {
					config.paddingBottom = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Padding Left',
				get value() {
					return config.paddingLeft;
				},

				set value($$value) {
					config.paddingLeft = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Padding Right',
				get value() {
					return config.paddingRight;
				},

				set value($$value) {
					config.paddingRight = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> `);

			if (config.isFiltered !== undefined) {
				$$renderer.push(`<!--[0--><div class="grid grid-cols-4 gap-2">`);

				Field($$renderer, {
					label: 'Apply Partial Filter',
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { id }) => {
							Switch($$renderer, {
								id,
								get checked() {
									return config.isFiltered;
								},

								set checked($$value) {
									config.isFiltered = $$value;
									$$settled = false;
								}
							});
						}
					}
				});

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
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