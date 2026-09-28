import * as $ from 'svelte/internal/server';
import { Field, RangeField, ToggleGroup, ToggleOption, Switch } from 'svelte-ux';

export default function PartitionControls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			padding = 0,
			fullSizeLeafNodes = false,
			round = false,
			colorBy = 'children',
			isFiltered = undefined
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid grid-cols-[2fr_1fr_1fr_1fr] gap-2 screenshot-hidden">`);

			RangeField($$renderer, {
				label: 'Padding',
				max: 20,
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
				label: 'Full-size Leaf Nodes',
				children: ($$renderer) => {
					ToggleGroup($$renderer, {
						variant: 'outline',
						size: 'sm',
						inset: true,
						class: 'w-full',
						get value() {
							return fullSizeLeafNodes;
						},

						set value($$value) {
							fullSizeLeafNodes = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							ToggleOption($$renderer, {
								value: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Yes`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: false,
								children: ($$renderer) => {
									$$renderer.push(`<!---->No`);
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
				label: 'Round',
				children: ($$renderer) => {
					ToggleGroup($$renderer, {
						variant: 'outline',
						size: 'sm',
						inset: true,
						class: 'w-full',
						get value() {
							return round;
						},

						set value($$value) {
							round = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							ToggleOption($$renderer, {
								value: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Yes`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: false,
								children: ($$renderer) => {
									$$renderer.push(`<!---->No`);
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
							return colorBy;
						},

						set value($$value) {
							colorBy = $$value;
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

			$$renderer.push(`<!----></div> `);

			if (isFiltered !== undefined) {
				$$renderer.push(`<!--[0--><div class="grid grid-cols-4 gap-2 mt-2">`);

				Field($$renderer, {
					label: 'Apply Partial Filter',
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { id }) => {
							Switch($$renderer, {
								id,
								get checked() {
									return isFiltered;
								},

								set checked($$value) {
									isFiltered = $$value;
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

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { padding, fullSizeLeafNodes, round, colorBy, isFiltered });
	});
}