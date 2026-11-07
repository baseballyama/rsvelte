import * as $ from 'svelte/internal/server';
import { Indicator, indicator, Button, Label, Radio, uiHelpers } from "$lib";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// MetaTag
		let breadcrumb_title = "Indicator builder";

		let description = "A quick way to create Indicator component";
		let title = "Indicator builder";
		let dir = "builder";

		// color, size, rounded, border, placement and offset
		const sizes = Object.keys(indicator.variants.size);

		const colors = Object.keys(indicator.variants.color);
		const placements = Object.keys(indicator.variants.placement);
		let color = "primary";
		let size = "md";
		let border = false;

		const changeBorder = () => {
			border = !border;
		};

		let cornerStyle = "circular";

		const changeCornerStyle = () => {
			cornerStyle = cornerStyle === "circular" ? "rounded" : "circular";
		};

		let placement = "default";

		// code generator
		let generatedCode = $.derived(() => (() => {
			let props = [];

			// {color} {size} {border} {placement} {cornerStyle}
			// color = 'primary', cornerStyle = 'circular', size = 'md', border = false, placement, offset = true,
			// if (color) props.push(` color="${color}"`);
			if (color !== "primary") props.push(` color="${color}"`);

			if (size !== "md") props.push(` size="${size}"`);
			if (border) props.push(" border");
			if (placement !== "default") props.push(` placement="${placement}"`);
			if (cornerStyle !== "circular") props.push(` cornerStyle="${cornerStyle}"`);

			const propsString = props.length > 0
				? props.map((prop) => `\n  ${prop}`).join("") + "\n"
				: "";

			return `<div class="borer relative h-56 w-56 rounded-lg border-gray-300 m-8">
  <Indicator${propsString} />
</div>`;
		})());

		// for interactive builder
		let builder = uiHelpers();

		let builderExpand = false;
		let showBuilderExpandButton = $.derived(() => isGeneratedCodeOverflow(generatedCode()));

		const handleBuilderExpandClick = () => {
			builderExpand = !builderExpand;
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			MetaTag($$renderer, { breadcrumb_title, description, title, dir });
			$$renderer.push(`<!----> `);

			H1($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Indicator Builder`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			{
				function codeblock($$renderer) {
					DynamicCodeBlockHighlight($$renderer, {
						handleExpandClick: handleBuilderExpandClick,
						expand: builderExpand,
						showExpandButton: showBuilderExpandButton(),
						code: generatedCode()
					});
				}

				CodeWrapper($$renderer, {
					codeblock,
					children: ($$renderer) => {
						$$renderer.push(`<div class="borer relative h-56 w-56 rounded-lg border-gray-300 bg-gray-200 dark:border-gray-700 dark:bg-gray-800">`);
						Indicator($$renderer, { color, size, border, placement, cornerStyle });
						$$renderer.push(`<!----></div> <div class="mt-8 space-y-4"><div class="flex flex-wrap space-x-2">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Color`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array = $.ensure_array_like(colors);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let colorOption = each_array[$$index];

							Radio($$renderer, {
								classes: { label: "w-24 my-1" },
								name: 'color',
								color: colorOption,
								value: colorOption,
								get group() {
									return color;
								},

								set group($$value) {
									color = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(colorOption)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="flex flex-wrap space-x-4">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Size`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array_1 = $.ensure_array_like(sizes);

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let sizeOption = each_array_1[$$index_1];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-24" },
								name: 'size',
								value: sizeOption,
								get group() {
									return size;
								},

								set group($$value) {
									size = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(sizeOption)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="flex flex-wrap space-x-4">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Placement`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array_2 = $.ensure_array_like(placements);

						for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
							let positionOption = each_array_2[$$index_2];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-32" },
								name: 'placement',
								value: positionOption,
								get group() {
									return placement;
								},

								set group($$value) {
									placement = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(positionOption)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> `);

						Button($$renderer, {
							onclick: changeBorder,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(border ? "Remove border" : "Add border")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							onclick: changeCornerStyle,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(cornerStyle === "circular" ? "Rounded" : "Circular")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div>`);
					},
					$$slots: { codeblock: true, default: true }
				});
			}

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}