import * as $ from 'svelte/internal/server';
import { Toggle, toggle, Radio, Label, Button, uiHelpers } from "$lib";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// MetaTag
		let breadcrumb_title = "Toggle builder";

		let description = "A quick way to create Toggle component";
		let title = "Toggle builder";
		let dir = "builder";
		const colors = Object.keys(toggle.variants.color);
		let toggleColor = "primary";
		const sizes = Object.keys(toggle.variants.size);
		let toggleSize = "default";
		let checked = false;

		const changeChecked = () => {
			checked = !checked;
		};

		let disabled = false;

		const changeDisabled = () => {
			disabled = !disabled;
		};

		let leftSlot = false;

		const changeLeftLabel = () => {
			leftSlot = !leftSlot;
			checked = false;
		};

		// code generator
		let generatedCode = $.derived(() => (() => {
			let props = [];

			// let fileSlot = '';
			if (toggleSize !== "default") props.push(` size="${toggleSize}"`);

			if (toggleColor !== "primary") props.push(` color="${toggleColor}"`);
			if (checked) props.push(" checked");
			if (disabled) props.push(" disabled");
			if (leftSlot) props.push(" bind:checked");

			const propsString = props.length > 0
				? props.map((prop) => `\n  ${prop}`).join("") + "\n"
				: "";

			return `<Toggle${propsString}>${leftSlot
				? `\n {#snippet leftLabel()}\n  <div class="me-4 {!checked ? 'text-red-600 font-semibold' : ''}">Off</div>\n {/snippet}\n <div class={checked ? 'text-green-600 font-semibold' : ''}>On</div>\n`
				: "Toggle me"}</Toggle>`;
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
					$$renderer.push(`<!---->Toggle Builder`);
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
						$$renderer.push(`<div class="h-12">`);

						{
							function offLabel($$renderer) {
								if (leftSlot) {
									$$renderer.push(`<!--[0--><div${$.attr_class(`me-4 ${!checked ? 'font-semibold text-red-600' : ''}`)}>Off</div>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
							}

							Toggle($$renderer, {
								color: toggleColor,
								size: toggleSize,
								disabled,
								get checked() {
									return checked;
								},

								set checked($$value) {
									checked = $$value;
									$$settled = false;
								},
								offLabel,
								children: ($$renderer) => {
									if (!leftSlot) {
										$$renderer.push('<!--[0-->');

										if (disabled) {
											$$renderer.push(`<!--[0-->Disabled`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> `);

										if (checked) {
											$$renderer.push(`<!--[0-->Checked`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> Toggle`);
									} else {
										$$renderer.push(`<!--[-1--><div${$.attr_class($.clsx(checked ? "font-semibold text-green-600" : ""))}>On</div>`);
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { offLabel: true, default: true }
							});
						}

						$$renderer.push(`<!----></div> <div class="mb-4 flex flex-wrap">`);

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
								class: 'm-2',
								classes: { label: "w-24" },
								name: 'toggle_color',
								color: colorOption,
								value: colorOption,
								get group() {
									return toggleColor;
								},

								set group($$value) {
									toggleColor = $$value;
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

						$$renderer.push(`<!----> <!--[-->`);

						const each_array_1 = $.ensure_array_like(sizes);

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let size = each_array_1[$$index_1];

							Radio($$renderer, {
								class: 'm-2',
								classes: { label: "w-32" },
								name: 'toggle_size',
								value: size,
								get group() {
									return toggleSize;
								},

								set group($$value) {
									toggleSize = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(size)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start">`);

						Button($$renderer, {
							class: 'w-40',
							onclick: changeChecked,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(checked ? "Remove checked" : "Add checked")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'secondary',
							onclick: changeDisabled,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(disabled ? "Remove disabled" : "Add disabled")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'emerald',
							onclick: changeLeftLabel,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(leftSlot ? "Remove left slot" : "Add left slot")}`);
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