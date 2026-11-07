import * as $ from 'svelte/internal/server';
import { Select, Label, Radio, Helper, uiHelpers, Button } from "$lib";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// MetaTag
		let breadcrumb_title = "Select builder";

		let description = "A quick way to create Select component";
		let title = "Select builder";
		let dir = "builder";

		let countries = [
			{ value: "us", name: "United States", href: "/" },
			{ value: "ca", name: "Canada", href: "/" },
			{ value: "fr", name: "France", href: "/" }
		];

		const sizes = ["sm", "md", "lg"];
		let selectSize = "md";
		const sizeDisplay = { sm: "Small", md: "Medium", lg: "Large" };
		let underline = false;

		const changeUnderline = () => {
			underline = !underline;
		};

		let disabled = false;

		const changeDiabled = () => {
			disabled = !disabled;
		};

		let selected = "";
		let bindValue = false;

		const changeBindValue = () => {
			bindValue = !bindValue;
		};

		// code generator
		let generatedCode = $.derived(() => (() => {
			let props = [];

			// let fileSlot = '';
			if (selectSize !== "md") props.push(` size="${selectSize}"`);

			if (underline) props.push(" underline");
			if (disabled) props.push(" disabled");
			if (bindValue) props.push(" bind:value={selected}");

			const propsString = props.length > 0
				? props.map((prop) => `\n  ${prop}`).join("") + "\n"
				: "";

			return `<Select${propsString} />${bindValue ? "\nSelected value: {selected}" : ""}`;
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
					$$renderer.push(`<!---->Select Builder`);
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
						$$renderer.push(`<div class="h-32">`);

						Label($$renderer, {
							for: 'select-sm',
							class: 'mb-4',
							children: ($$renderer) => {
								if (disabled) {
									$$renderer.push(`<!--[0-->Disabled`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--> `);

								if (selectSize) {
									$$renderer.push(`<!--[0-->${$.escape(sizeDisplay[selectSize])} select`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Select($$renderer, {
							id: 'select-sm',
							size: selectSize,
							items: countries,
							underline,
							disabled,
							class: 'mb-2',
							get value() {
								return selected;
							},

							set value($$value) {
								selected = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						if (bindValue) {
							$$renderer.push('<!--[0-->');

							Helper($$renderer, {
								class: 'text-base',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Selected value: ${$.escape(selected)}`);
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
								$$renderer.push(`<!---->Size`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array = $.ensure_array_like(sizes);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let option = each_array[$$index];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-24" },
								name: 'input_size',
								value: option,
								get group() {
									return selectSize;
								},

								set group($$value) {
									selectSize = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(option)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start">`);

						Button($$renderer, {
							class: 'w-40',
							onclick: changeUnderline,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(underline ? "Default" : "Underline")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'secondary',
							onclick: changeDiabled,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(disabled ? "Enabled" : "Disabled")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'rose',
							onclick: changeBindValue,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(bindValue ? "Unbind" : "Bind value")}`);
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