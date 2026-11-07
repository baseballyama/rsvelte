import * as $ from 'svelte/internal/server';
import { Table, table, uiHelpers, Label, Radio, Button } from "$lib";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// MetaTag
		let breadcrumb_title = "Table builder";

		let description = "A quick way to create Table component";
		let title = "Table builder";
		let dir = "builder";
		let color = "default";
		const colors = Object.keys(table.variants.color);
		let striped = false;

		const changeStriped = () => {
			striped = !striped;
		};

		let hoverable = false;

		const changeHoverable = () => {
			hoverable = !hoverable;
		};

		// noborder, shadow,
		let noborder = false;

		const changeNoborder = () => {
			noborder = !noborder;
		};

		let shadow = false;

		const changeShadow = () => {
			shadow = !shadow;
		};

		const tableItems = [
			{
				name: 'Apple MacBook Pro 17"',
				color: "Silver",
				type: "Laptop",
				price: "$2999"
			},

			{
				name: "Microsoft Surface Pro",
				color: "White",
				type: "Laptop PC",
				price: "$1999"
			},

			{
				name: "Magic Mouse 2",
				color: "Black",
				type: "Accessories",
				price: "$99"
			},

			{
				name: "Google Pixel Phone",
				color: "Gray",
				type: "Phone",
				price: "$799"
			},

			{
				name: "Apple Watch 5",
				color: "Red",
				type: "Wearables",
				price: "$999"
			}
		];

		// code generator
		let generatedCode = $.derived(() => (() => {
			let props = [];

			if (color !== "default") props.push(` color="${color}"`);
			if (striped) props.push(" striped");
			if (hoverable) props.push(" hoverable");
			if (!noborder) props.push(" noborder");
			if (shadow) props.push(" shadow");

			const propsString = props.length > 0
				? props.map((prop) => `\n  ${prop}`).join("") + "\n"
				: "";

			return `<Table {tableItems}${propsString} />`;
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
					$$renderer.push(`<!---->Table Builder`);
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
						Table($$renderer, {
							items: tableItems,
							hoverable,
							color,
							striped,
							border: noborder,
							shadow
						});

						$$renderer.push(`<!----> <div class="my-4 flex flex-wrap space-x-4">`);

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
								class: 'my-1',
								classes: { label: "w-24" },
								name: 'table_color',
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

						$$renderer.push(`<!--]--></div> <div class="mb-4 flex gap-4">`);

						Button($$renderer, {
							class: 'w-40',
							onclick: changeStriped,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(striped ? "Unstriped" : "Striped")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'secondary',
							onclick: changeHoverable,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(hoverable ? "Unhoverable" : "Hoverable")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'indigo',
							onclick: changeNoborder,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(noborder ? "Borderless" : "Border")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'rose',
							onclick: changeShadow,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(shadow ? "No Shadow" : "Shadow")}`);
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