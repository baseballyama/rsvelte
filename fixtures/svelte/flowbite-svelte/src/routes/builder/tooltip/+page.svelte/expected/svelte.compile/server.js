import * as $ from 'svelte/internal/server';
import { Button, Tooltip, tooltip, Radio, Label, uiHelpers } from "$lib";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// MetaTag
		let breadcrumb_title = "Tooltip builder";

		let description = "A quick way to create Tooltip component";
		let title = "Tooltip builder";
		let dir = "builder";

		// for interactive code builder
		// const position: Placement = Object.keys(tooltip.variants.position);
		const placements = [
			"top",
			"right",
			"bottom",
			"left",
			"top-start",
			"top-end",
			"right-start",
			"right-end",
			"bottom-start",
			"bottom-end",
			"left-start",
			"left-end"
		];

		let placement = "top";
		const colors = Object.keys(tooltip.variants.color);
		let color = void 0;
		let tooltipClass = "";

		const changeClass = () => {
			tooltipClass = tooltipClass === "" ? "p-4" : "";
		};

		let arrow = true;

		const changeArrow = () => {
			arrow = !arrow;
		};

		let offset = 6;

		function increaseOffset() {
			offset += 2;
		}

		function decreaseOffset() {
			if (offset > 0) {
				offset -= 2;
			}
		}

		// code generator
		let generatedCode = $.derived(() => (() => {
			let props = [];

			if (arrow !== true) props.push(`arrow="${arrow}"`);
			if (color) props.push(`color="${color}"`);
			if (placement !== "top") props.push(`placement="${placement}"`);
			if (offset) props.push(`offset={${offset}}`);
			if (tooltipClass !== "") props.push(`class="${tooltipClass}"`);

			const propsString = props.length > 0
				? props.map((prop) => `\n  ${prop}`).join("") + "\n"
				: "";

			return `<Button id="type-1" class="m-8">Tooltip trigger</Button>\n<Tooltip${propsString}  triggeredBy="#type-1">Tooltip content</Tooltip>`;
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
					$$renderer.push(`<!---->Tooltip Builder`);
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
						$$renderer.push(`<div class="my-4 flex justify-center">`);

						Button($$renderer, {
							id: 'type-1',
							class: 'm-8',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Tooltip trigger`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Tooltip($$renderer, {
							triggeredBy: '#type-1',
							color,
							placement,
							arrow,
							offset,
							class: tooltipClass,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Tooltip content`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div> <div class="mb-4 flex flex-wrap space-x-2">`);

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

						$$renderer.push(`<!--]--></div> <div class="mb-4 flex flex-wrap space-x-2">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Position`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array_1 = $.ensure_array_like(placements);

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let option = each_array_1[$$index_1];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-32" },
								name: 'interactive_toast_position',
								value: option,
								get group() {
									return placement;
								},

								set group($$value) {
									placement = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(option)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="mb-4">`);

						Button($$renderer, {
							onclick: decreaseOffset,
							class: 'rounded border p-1',
							children: ($$renderer) => {
								$$renderer.push(`<!---->-`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <span class="mx-2">Offset: ${$.escape(offset)}px</span> `);

						Button($$renderer, {
							onclick: increaseOffset,
							class: 'rounded border p-1',
							children: ($$renderer) => {
								$$renderer.push(`<!---->+`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start">`);

						Button($$renderer, {
							class: 'w-36',
							onclick: changeClass,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(tooltipClass ? "Remove class" : "Add class")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-36',
							color: 'secondary',
							onclick: changeArrow,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(arrow ? "Remove arrow" : "Add arrow")}`);
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