import * as $ from 'svelte/internal/server';
import { Range, range, Label, Button, Radio, uiHelpers } from "$lib";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// MetaTag
		let breadcrumb_title = "Range builder";

		let description = "A quick way to create Range component";
		let title = "Range builder";
		let dir = "builder";
		let interactiveValue = 5;
		let stepValue = 1;

		const changeStepValue = () => {
			stepValue = stepValue === 0.5 ? 1 : 0.5;
		};

		const colors = Object.keys(range.variants.color);
		let rangeColor = "blue";
		let disabled = false;

		const changeDisabled = () => {
			disabled = !disabled;
		};

		let minmax = { min: 0, max: 10 };

		const changeMinMax = () => {
			if (minmax.max === 10) {
				minmax.min = 0;
				minmax.max = 20;
				interactiveValue = 10;
			} else {
				minmax.min = 0;
				minmax.max = 10;
				interactiveValue = 5;
			}
		};

		let labelStatus = false;

		const changeLabelStatus = () => {
			labelStatus = !labelStatus;
		};

		// code generator
		let generatedCode = $.derived(() => (() => {
			let props = [];

			if (rangeColor) props.push(`color="${rangeColor}"`);
			if (minmax.max !== 10) props.push(`min="${minmax.min}" max="${minmax.max}"`);
			if (stepValue !== 1) props.push(`step="${stepValue}"`);
			if (disabled) props.push("disabled");

			const propsString = props.length > 0
				? props.map((prop) => `\n  ${prop}`).join("") + "\n"
				: "";

			return `${labelStatus ? `<div class="relative">\n  ` : ""}<Range${propsString}/>
${labelStatus
				? `<span class="text-sm text-gray-500 dark:text-gray-400 absolute start-0 -bottom-6">Min: ${minmax.min}</span>
<span class="text-sm text-gray-500 dark:text-gray-400 absolute start-1/2 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">${minmax.max / 2}</span>
<span class="text-sm text-gray-500 dark:text-gray-400 absolute end-0 -bottom-6">Max: ${minmax.max}</span></div>`
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
					$$renderer.push(`<!---->Range Builder`);
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
						$$renderer.push(`<div class="relative">${$.escape(stepValue !== 1 ? `Step: ${stepValue}` : "")} `);

						if (minmax.max !== 10) {
							$$renderer.push(`<!--[0--><p>Value: ${$.escape(interactiveValue)}</p>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						Range($$renderer, {
							color: rangeColor,
							disabled,
							min: minmax.min,
							max: minmax.max,
							step: stepValue,
							appearance: 'auto',
							get value() {
								return interactiveValue;
							},

							set value($$value) {
								interactiveValue = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						if (labelStatus) {
							$$renderer.push(`<!--[0--><span class="absolute start-0 -bottom-6 text-sm text-gray-500 dark:text-gray-400">Min: ${$.escape(minmax.min)}</span> <span class="absolute start-1/2 -bottom-6 -translate-x-1/2 text-sm text-gray-500 rtl:translate-x-1/2 dark:text-gray-400">${$.escape(minmax.max / 2)}</span> <span class="absolute end-0 -bottom-6 text-sm text-gray-500 dark:text-gray-400">Max: ${$.escape(minmax.max)}</span>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div> <div class="mt-12 mb-4 flex flex-wrap space-x-2">`);

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
								name: 'default_alert_color',
								color: colorOption,
								value: colorOption,
								get group() {
									return rangeColor;
								},

								set group($$value) {
									rangeColor = $$value;
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
							class: 'w-40',
							onclick: changeDisabled,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(disabled ? "Enabled" : "Disabled")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'secondary',
							onclick: changeMinMax,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(minmax.max === 10 ? "Add max min" : "Remove max min")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'rose',
							onclick: changeLabelStatus,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(labelStatus ? "Remove label" : "Add label")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'indigo',
							onclick: changeStepValue,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(stepValue !== 0.5 ? "Add step" : "Remove step")}`);
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