import * as $ from 'svelte/internal/server';
import { Hr, P, Label, Radio, uiHelpers } from "$lib";
import { QuoteSolid } from "flowbite-svelte-icons";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// MetaTag
		let breadcrumb_title = "Hr builder";

		let description = "A quick way to create Hr component";
		let title = "Hr builder";
		let dir = "builder";
		const types = ["default", "trimmed", "icon", "text", "shape"];
		let selectedStyle = "default";

		// code generator
		let generatedCode = $.derived(() => (() => {
			let hr;

			if (selectedStyle === "default") {
				hr = `<Hr hrClass="my-8" />`;
			}

			if (selectedStyle === "trimmed") {
				hr = `<Hr hrClass="w-48 h-1 mx-auto my-4 rounded md:my-10" />`;
			}

			if (selectedStyle === "icon") {
				hr = `<Hr hrClass="my-8 w-64 h-1" icon>
  <QuoteSolid class="w-4 h-4 text-gray-700 dark:text-gray-300" />
</Hr>`;
			}

			if (selectedStyle === "text") {
				hr = `<Hr hrClass="my-8 w-64">or</Hr>`;
			}

			if (selectedStyle === "shape") {
				hr = `<Hr hrClass="my-8 mx-auto w-8 h-8" />`;
			}

			return `<p>Lorem ipsum dolor sit amet.</p> 
   ${hr} 
<p>Fusce eu vitae pretium libero imperdiet.</p>`;
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
					$$renderer.push(`<!---->Hr Builder`);
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
						$$renderer.push(`<div class="mb-4 sm:h-[250px] md:h-[200px]">`);

						P($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Track work across the enterprise through an open, collaborative platform. Link issues across Jira and ingest data from other software development tools.`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						if (selectedStyle === "trimmed") {
							$$renderer.push('<!--[0-->');
							Hr($$renderer, { class: 'mx-auto my-4 h-1 w-48 rounded md:my-10' });
						} else if (selectedStyle === "icon") {
							$$renderer.push('<!--[1-->');

							Hr($$renderer, {
								class: 'my-8 h-1 w-64',
								children: ($$renderer) => {
									QuoteSolid($$renderer, { class: 'h-6 w-6 text-gray-700 dark:text-gray-300' });
								},
								$$slots: { default: true }
							});
						} else if (selectedStyle === "text") {
							$$renderer.push('<!--[2-->');

							Hr($$renderer, {
								class: 'my-8 w-64',
								children: ($$renderer) => {
									$$renderer.push(`<!---->or`);
								},
								$$slots: { default: true }
							});
						} else if (selectedStyle === "shape") {
							$$renderer.push('<!--[3-->');
							Hr($$renderer, { class: 'mx-auto my-8 h-8 w-8' });
						} else {
							$$renderer.push('<!--[-1-->');
							Hr($$renderer, { class: 'my-8' });
						}

						$$renderer.push(`<!--]--> `);

						P($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Deliver great service experiences fast - without the complexity of traditional ITSM solutions.Accelerate critical development work, eliminate toil.`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div> <div class="flex flex-wrap space-x-2">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Color`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array = $.ensure_array_like(types);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let type = each_array[$$index];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-20" },
								name: 'hr_style',
								value: type,
								get group() {
									return selectedStyle;
								},

								set group($$value) {
									selectedStyle = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(type)}`);
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