import * as $ from 'svelte/internal/server';

import {
	Input,
	input,
	Radio,
	Label,
	Helper,
	Button,
	CloseButton,
	uiHelpers
} from "$lib";

import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// MetaTag
		let breadcrumb_title = "Input field builder";

		let description = "A quick way to create Input field component";
		let title = "Input field builder";
		let dir = "builder";
		let { text = "" } = $$props;
		const sizes = ["sm", "md", "lg"];
		let inputSize = "md";
		const colors = Object.keys(input.variants.color);
		let inputColor = "default";
		let disabled = false;

		const changeDisabled = () => {
			disabled = !disabled;
		};

		let helperColor = "default";
		let helperSlot = false;

		const changeHelperSlot = () => {
			helperSlot = !helperSlot;
			helperColor = "default";
		};

		let closeBtnStatus = false;

		const changeCloseBtnStatus = () => {
			closeBtnStatus = !closeBtnStatus;
		};

		// code generator
		let generatedCode = $.derived(() => (() => {
			let props = [];

			if (inputColor !== "default") props.push(` color="${inputColor}"`);
			if (disabled) props.push(" disabled");
			if (inputSize !== "md") props.push(` size="${inputSize}"`);

			const propsString = props.length > 0
				? props.map((prop) => `\n  ${prop}`).join("") + "\n"
				: "";

			return `<Input${propsString}${closeBtnStatus
				? `>\n{#snippet right()}
  <CloseButton onclick={() => (text = '')} />
{/snippet}`
				: "/>"}
${closeBtnStatus ? `</Input>` : ""}${helperSlot
				? `<Helper class="ps-6" color="${helperColor}">Helper text</Helper>`
				: ""}`;
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
					$$renderer.push(`<!---->Input Builder`);
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
						$$renderer.push(`<div class="mb-4 md:h-24">`);

						Label($$renderer, {
							for: 'color-example',
							color: inputColor,
							class: 'mb-2 block',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Your name`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						{
							function right($$renderer) {
								if (closeBtnStatus) {
									$$renderer.push('<!--[0-->');
									CloseButton($$renderer, { onclick: () => text = "" });
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
							}

							Input($$renderer, {
								id: 'color-example',
								disabled,
								color: inputColor,
								size: inputSize,
								placeholder: disabled ? "Disabled " : "Placeholder",
								get value() {
									return text;
								},

								set value($$value) {
									text = $$value;
									$$settled = false;
								},
								right,
								$$slots: { right: true }
							});
						}

						$$renderer.push(`<!----> `);

						if (helperSlot) {
							$$renderer.push('<!--[0-->');

							Helper($$renderer, {
								class: 'mt-2',
								color: helperColor,
								children: ($$renderer) => {
									$$renderer.push(`<span class="font-medium">Well done!</span> Some helper message.`);
								},
								$$slots: { default: true }
							});
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div> <div class="mb-4 flex flex-wrap space-x-2">`);

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
								classes: { label: "w-20" },
								name: 'input_color',
								color: colorOption,
								value: colorOption,
								get group() {
									return inputColor;
								},

								set group($$value) {
									inputColor = $$value;
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
								$$renderer.push(`<!---->Size`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array_1 = $.ensure_array_like(sizes);

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let option = each_array_1[$$index_1];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-20" },
								name: 'input_size',
								value: option,
								get group() {
									return inputSize;
								},

								set group($$value) {
									inputSize = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(option)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="mb-4 flex flex-wrap space-x-2">`);

						Button($$renderer, {
							class: 'mb-4 w-40',
							color: 'secondary',
							onclick: changeHelperSlot,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(helperSlot ? "Remove helper" : "Add helper")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Helper Color`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array_2 = $.ensure_array_like(colors);

						for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
							let colorOption = each_array_2[$$index_2];

							Radio($$renderer, {
								class: `my-1 ${helperSlot ? '' : 'cursor-not-allowed opacity-30'}`,
								classes: { label: "w-20" },
								disabled: helperSlot ? false : true,
								name: 'helper_color',
								color: colorOption,
								value: colorOption,
								get group() {
									return helperColor;
								},

								set group($$value) {
									helperColor = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(colorOption)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start">`);

						Button($$renderer, {
							class: 'w-44',
							onclick: changeDisabled,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(disabled ? "Remove disabled" : "Add disabled")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-44',
							color: 'secondary',
							onclick: changeCloseBtnStatus,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(closeBtnStatus ? "Remove close button" : "Add close button")}`);
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
		$.bind_props($$props, { text });
	});
}