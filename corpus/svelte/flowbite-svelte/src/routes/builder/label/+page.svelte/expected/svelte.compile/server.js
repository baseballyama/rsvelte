import * as $ from 'svelte/internal/server';
import { Label, label, Radio, uiHelpers } from "$lib";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { capitalizeFirstLetter } from "../utils/helpers";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// MetaTag
		let breadcrumb_title = "Label builder";

		let description = "A quick way to create Label component";
		let title = "Label builder";
		let dir = "builder";
		const colors = Object.keys(label.variants.color);
		let labelColor = "gray";

		// code generator
		let generatedCode = $.derived(() => (() => {
			let props = [];

			if (labelColor !== "gray") props.push(` color="${labelColor}"`);

			const propsString = props.length > 0
				? props.map((prop) => `\n  ${prop}`).join("") + "\n"
				: "";

			return `<Label${propsString}>Label</Label>`;
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
					$$renderer.push(`<!---->Label Builder`);
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
						Label($$renderer, {
							class: 'text-lg font-bold',
							color: labelColor,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(capitalizeFirstLetter(labelColor))}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <div class="flex flex-wrap space-x-2">`);

						Label($$renderer, {
							class: 'm-4 w-full font-bold',
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
									return labelColor;
								},

								set group($$value) {
									labelColor = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(colorOption)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div>`);
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