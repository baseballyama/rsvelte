import * as $ from 'svelte/internal/server';
import { Checkbox, checkbox, Helper, Label, Radio, Button, uiHelpers } from "$lib";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// MetaTag
		let breadcrumb_title = "Checkbox builder";

		let description = "A quick way to create Checkbox component";
		let title = "Checkbox builder";
		let dir = "builder";
		const colors = Object.keys(checkbox.variants.color);
		let checkboxColor = "primary";

		// const checkedStates = [ 'false', 'true', 'indeterminate' ];
		let checkedState = false;

		const changeCheckedState = () => {
			checkedState = !checkedState;
			indeterminateState = false;
		};

		let indeterminateState = false;

		const changeIntermidiateState = () => {
			indeterminateState = !indeterminateState;
			checkedState = false;
		};

		let disabledState = false;

		const changeDisabledState = () => {
			disabledState = !disabledState;
		};

		let helperState = false;

		const changeHelperState = () => {
			helperState = !helperState;
		};

		// code generator
		let generatedCode = $.derived(() => (() => {
			let props = [];

			if (checkedState) props.push(" checked");
			if (indeterminateState) props.push(" indeterminate");
			if (disabledState) props.push(" disabled");

			const propsString = props.length > 0
				? props.map((prop) => `\n  ${prop}`).join("") + "\n"
				: "";

			return `<Checkbox${propsString}>My Checkbox</Checkbox>
${helperState ? `<Helper class="ps-6">Helper text</Helper>` : ""}`;
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
					$$renderer.push(`<!---->Checkbox Builder`);
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
						$$renderer.push(`<div class="md:h-8">`);

						Checkbox($$renderer, {
							checked: checkedState,
							indeterminate: indeterminateState,
							color: checkboxColor,
							disabled: disabledState,
							children: ($$renderer) => {
								if (disabledState) {
									$$renderer.push(`<!--[0-->This is disabled`);
								} else {
									$$renderer.push(`<!--[-1-->Default checkbox`);
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						if (helperState) {
							$$renderer.push('<!--[0-->');

							Helper($$renderer, {
								id: 'helper-checkbox-text',
								class: 'ps-6',
								children: ($$renderer) => {
									$$renderer.push(`<!---->For orders shipped from $25 in books or $29 in other categories`);
								},
								$$slots: { default: true }
							});
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div> <div class="mt-4 mb-4 flex flex-wrap space-x-4">`);

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
								name: 'checkbox_color',
								color: colorOption,
								onchange: () => checkedState = true,
								value: colorOption,
								get group() {
									return checkboxColor;
								},

								set group($$value) {
									checkboxColor = $$value;
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
							class: 'w-48',
							color: 'primary',
							onclick: changeCheckedState,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(checkedState ? "Remove checked" : "Add checked")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-48',
							color: 'secondary',
							onclick: changeIntermidiateState,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(indeterminateState ? "Remove indeterminate" : "Add indeterminate")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-48',
							color: 'pink',
							onclick: changeDisabledState,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(disabledState ? "Remove disabled" : "Add disabled")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-48',
							color: 'lime',
							onclick: changeHelperState,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(helperState ? "Remove helper" : "Add helper")}`);
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