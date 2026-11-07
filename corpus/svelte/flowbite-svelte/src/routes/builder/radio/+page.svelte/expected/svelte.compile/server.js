import * as $ from 'svelte/internal/server';
import { Radio, radio, Helper, Label, Button, uiHelpers } from "$lib";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// MetaTag
		let breadcrumb_title = "Radio builder";

		let description = "A quick way to create Radio component";
		let title = "Radio builder";
		let dir = "builder";

		// end of dynamic svelte component
		const colors = Object.keys(radio.variants.color);

		let radioColor = "primary";

		// hack for demo purposes
		let demoRadioColor = "primary";

		let isChecked = true;

		const handleOnchange = (colorOption) => {
			demoRadioColor = colorOption;
			isChecked = false;
			isChecked = true;
		};

		// end of hack
		const inputClasses = ["", "w-6 h-6"];

		let inputClass = inputClasses[0];

		const changeInputClass = () => {
			inputClass = inputClass === inputClasses[0] ? inputClasses[1] : inputClasses[0];
		};

		const labelClasses = ["w-24 m-2", ""];
		let labelClass = labelClasses[0];

		const changeLabelClass = () => {
			labelClass = labelClass === labelClasses[0] ? labelClasses[1] : labelClasses[0];
		};

		let disabled = false;

		const changeDisabled = () => {
			disabled = !disabled;
		};

		let helperColor = "primary";
		let helperSlot = false;

		const changeHelperSlot = () => {
			helperSlot = !helperSlot;

			// helperColor = 'gray';
		};

		// code generator
		let generatedCode = $.derived(() => (() => {
			let props = [];

			if (radioColor !== "primary") props.push(`color="${radioColor}"`);
			if (labelClass !== "") props.push(`classes={{label:"${labelClass}"}}`);
			if (inputClass !== "") props.push(`class="${inputClass}"`);
			if (disabled) props.push("disabled");

			// if (indeterminateState) props.push(' indeterminate');
			// if (disabledState) props.push(' disabled');
			const propsString = props.length > 0
				? props.map((prop) => `\n  ${prop}`).join("") + "\n"
				: "";

			return `<Radio
  name="my_radio"${propsString}>Item 1</Radio>
${helperSlot
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
					$$renderer.push(`<!---->Radio Builder`);
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
						$$renderer.push(`<div class="mb-4">`);

						Radio($$renderer, {
							class: inputClass,
							classes: { label: labelClass },
							name: 'radio_interactive',
							disabled,
							color: demoRadioColor,
							checked: isChecked,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Radio`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						if (helperSlot) {
							$$renderer.push('<!--[0-->');

							Helper($$renderer, {
								id: 'helper-radio-text',
								color: helperColor,
								class: 'ps-6',
								children: ($$renderer) => {
									$$renderer.push(`<!---->For orders shipped from $25 in books or $29 in other categories`);
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
								classes: { label: "w-24" },
								name: 'radio_color',
								onchange: () => handleOnchange(colorOption),
								color: colorOption,
								value: colorOption,
								get group() {
									return radioColor;
								},

								set group($$value) {
									radioColor = $$value;
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

						const each_array_1 = $.ensure_array_like(colors);

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let colorOption = each_array_1[$$index_1];

							Radio($$renderer, {
								class: `my-1${helperSlot ? '' : 'cursor-not-allowed opacity-30'}`,
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

						$$renderer.push(`<!--]--></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start">`);

						Button($$renderer, {
							class: 'w-32',
							color: 'primary',
							onclick: changeInputClass,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(inputClass === inputClasses[0] ? "class=w-6 h-6" : "Default size")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-32',
							color: 'secondary',
							onclick: changeLabelClass,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(labelClass === labelClasses[0] ? "Default label" : "label:w-24 m-2")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-32',
							color: 'lime',
							onclick: changeDisabled,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(disabled ? "Enabled" : "Disabled")}`);
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