import * as $ from 'svelte/internal/server';
import { Spinner, spinner, Button, Label, Radio, uiHelpers } from "$lib";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// MetaTag
		let breadcrumb_title = "Spinner builder";

		let description = "A quick way to create Spinner component";
		let title = "Spinner builder";
		let dir = "builder";

		// color, size, class
		const colors = Object.keys(spinner.variants.color);

		let spinnerColor = "primary";
		const sizes = ["4", "5", "6", "8", "10", "12", "16"];
		let spinnerSize = "8";
		let spinnerClass = "";

		const changeClass = () => {
			spinnerClass = spinnerClass === "" ? "ml-4" : "";
		};

		const alignments = [
			{ name: "left", class: "text-left" },
			{ name: "center", class: "text-center" },
			{ name: "right", class: "text-right" }
		];

		let selectedAlignment = "left";
		let currentSpinner = $.derived(() => alignments.find((t) => t.name === selectedAlignment) || alignments[0]);

		// code generator
		let generatedCode = $.derived(() => (() => {
			let props = [];

			if (spinnerSize !== "8") props.push(` size="${spinnerSize}"`);
			if (spinnerColor !== "primary") props.push(` color="${spinnerColor}"`);
			if (spinnerClass !== "") props.push(` class="${spinnerClass}"`);

			const propsString = props.length > 0
				? props.map((prop) => `\n  ${prop}`).join("") + "\n"
				: "";

			// alignment needs div wrapper
			if (selectedAlignment !== "left") {
				return `<div class="${currentSpinner().class}">\n  <Spinner${propsString}/>\n</div>`;
			} else {
				return `<Spinner${propsString}/>`;
			}
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
					$$renderer.push(`<!---->Spinner Builder`);
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
						$$renderer.push(`<div class="h-20"><div${$.attr_class($.clsx(currentSpinner().class))}>`);
						Spinner($$renderer, { color: spinnerColor, size: spinnerSize, class: spinnerClass });
						$$renderer.push(`<!----></div></div> <div class="mb-4 flex flex-wrap space-x-4">`);

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
							let color = each_array[$$index];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-24" },
								name: 'spinnercolor',
								color,
								value: color,
								get group() {
									return spinnerColor;
								},

								set group($$value) {
									spinnerColor = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(color)}`);
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
								class: 'my-1',
								classes: { label: "w-12" },
								name: 'spinnersize',
								value: size,
								get group() {
									return spinnerSize;
								},

								set group($$value) {
									spinnerSize = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(size)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="mb-4 flex flex-wrap space-x-4">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Alignment`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array_2 = $.ensure_array_like(alignments);

						for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
							let option = each_array_2[$$index_2];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-16" },
								name: 'alignment',
								value: option.name,
								get group() {
									return selectedAlignment;
								},

								set group($$value) {
									selectedAlignment = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(option.name)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> `);

						Button($$renderer, {
							class: 'w-36',
							onclick: changeClass,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(spinnerClass ? "Remove class" : "Add class")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
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