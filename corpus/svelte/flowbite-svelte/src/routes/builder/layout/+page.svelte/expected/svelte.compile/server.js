import * as $ from 'svelte/internal/server';
import { Label, Radio, uiHelpers } from "$lib";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isSvelteOverflow, getExampleFileName } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";
import * as ExampleComponents from "../layoutExamples/index";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// MetaTag
		let breadcrumb_title = "Layout builder";

		let description = "A quick way to create Layout component";
		let title = "Layout builder";
		let dir = "builder";

		// for Props table
		// import CompoAttributesViewer from '../utils/CompoAttributesViewer.svelte';
		// for examples section that dynamically changes the svelte component and svelteCode content
		const exampleModules = import.meta.glob("../layoutExamples/*.svelte", { query: "?raw", import: "default", eager: true });

		const exampleArr = [
			{ name: "One column", component: ExampleComponents.OneColumn },
			{
				name: "Two columns even",
				component: ExampleComponents.TwoColumnsEven
			},

			{
				name: "Two columns uneven",
				component: ExampleComponents.TwoColumnsUneven
			},

			{
				name: "Three columns even",
				component: ExampleComponents.ThreeColumnsEven
			}
		];

		let selectedExample = exampleArr[0].name;
		let svelteCode = $.derived(() => getExampleFileName(selectedExample, exampleArr));

		function findObject(arr, name) {
			const matchingObject = arr.find((obj) => obj.name === name);

			return matchingObject ? matchingObject.component : null;
		}

		const SelectedComponent = $.derived(() => findObject(exampleArr, selectedExample));

		// end of dynamic svelte component
		// for DynamicCodeBlock setup for examples section. dynamically adjust the height of the code block based on the svelteCode content.
		let codeBlock = uiHelpers();

		let expand = false;
		let showExpandButton = $.derived(() => isSvelteOverflow(svelteCode(), exampleModules));

		const handleExpandClick = () => {
			expand = !expand;
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			MetaTag($$renderer, { breadcrumb_title, description, title, dir });
			$$renderer.push(`<!----> `);

			H1($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Layout`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			{
				function codeblock($$renderer) {
					DynamicCodeBlockHighlight($$renderer, {
						replaceLib: true,
						handleExpandClick,
						expand,
						showExpandButton: showExpandButton(),
						code: exampleModules[`../layoutExamples/${svelteCode()}`]
					});
				}

				CodeWrapper($$renderer, {
					codeblock,
					children: ($$renderer) => {
						$$renderer.push(`<div class="mb-8 flex flex-wrap">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Example`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array = $.ensure_array_like(exampleArr);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let style = each_array[$$index];

							Radio($$renderer, {
								class: 'my-1 w-[170px]',
								onclick: () => expand = false,
								name: 'block_style',
								value: style.name,
								get group() {
									return selectedExample;
								},

								set group($$value) {
									selectedExample = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(style.name)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> `);

						if (SelectedComponent()) {
							$$renderer.push('<!--[-->');
							SelectedComponent()($$renderer, {});
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
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