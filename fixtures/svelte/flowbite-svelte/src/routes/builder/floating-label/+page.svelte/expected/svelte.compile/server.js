import * as $ from 'svelte/internal/server';

import {
	FloatingLabelInput,
	Helper,
	Label,
	Radio,
	Toggle,
	floatingLabelInput,
	Button
} from "$lib";

import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// MetaTag
		let breadcrumb_title = "Floating label builder";

		let description = "A quick way to create Floating label component";
		let title = "Floating label builder";
		let dir = "builder";
		const inputStyles = ["standard", "filled", "outlined"];
		let inputStyle = "standard";
		let floatingSize = "default";
		const colors = Object.keys(floatingLabelInput.variants.color);
		let floatingColor = "default";
		let helperColor = "default";
		let disabled = false;

		const changeDisabled = () => {
			disabled = !disabled;
		};

		let helperSlot = false;

		const changeHelperSlot = () => {
			helperSlot = !helperSlot;
			helperColor = "default";
		};

		// code generator
		let generatedCode = $.derived(() => (() => {
			let props = [];

			if (floatingColor !== "default") props.push(` color="${floatingColor}"`);
			if (disabled) props.push(" disabled");
			if (inputStyle !== "standard") props.push(` inputStyle="${inputStyle}"`);
			if (floatingSize !== "default") props.push(` size="${floatingSize}"`);

			const propsString = props.length > 0
				? props.map((prop) => `\n  ${prop}`).join("") + "\n"
				: "";

			let helperCode = "";

			if (helperSlot) {
				helperCode = `
<Helper class="pt-2" color="${helperColor}">
  Helper text
</Helper>`;
			}

			return `<FloatingLabelInput ${propsString}>
  Floating label
</FloatingLabelInput>${helperCode}`;
		})());

		// for interactive builder
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
					$$renderer.push(`<!---->Floating-label Builder`);
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
						$$renderer.push(`<div class="mb-4 md:h-20">`);

						FloatingLabelInput($$renderer, {
							variant: inputStyle,
							disabled,
							size: floatingSize,
							color: floatingColor,
							id: 'floating_filled',
							type: 'text',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Floating ${$.escape(inputStyle)}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						if (helperSlot) {
							$$renderer.push('<!--[0-->');

							Helper($$renderer, {
								class: 'pt-2',
								color: helperColor,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Remember, contributions to this topic should follow our <a href="/">Community Guidelines</a> .`);
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
								$$renderer.push(`<!---->Style`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array = $.ensure_array_like(inputStyles);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let option = each_array[$$index];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-24" },
								name: 'style1',
								value: option,
								get group() {
									return inputStyle;
								},

								set group($$value) {
									inputStyle = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(option)}`);
								},
								$$slots: { default: true }
							});
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

						const each_array_1 = $.ensure_array_like(colors);

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let colorOption = each_array_1[$$index_1];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-24" },
								name: 'floating_color',
								color: colorOption,
								value: colorOption,
								get group() {
									return floatingColor;
								},

								set group($$value) {
									floatingColor = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(colorOption)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="mb-4 flex flex-wrap space-x-2">`);

						Button($$renderer, {
							class: 'mb-4 w-48',
							color: 'secondary',
							onclick: changeHelperSlot,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(helperSlot ? "Remove helper slot" : "Add helper slot")}`);
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
								classes: { label: "w-24" },
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

						$$renderer.push(`<!--]--></div> <div class="mb-4 flex flex-wrap space-x-4">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Size`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						{
							function offLabel($$renderer) {
								$$renderer.push(`<span class="me-4">Default</span>`);
							}

							Toggle($$renderer, {
								onclick: () => {
									floatingSize = floatingSize === "default" ? "small" : "default";
								},
								offLabel,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Small`);
								},
								$$slots: { offLabel: true, default: true }
							});
						}

						$$renderer.push(`<!----></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start">`);

						Button($$renderer, {
							class: 'w-48',
							onclick: changeDisabled,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(disabled ? "Remove disabled" : "Add disabled")}`);
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