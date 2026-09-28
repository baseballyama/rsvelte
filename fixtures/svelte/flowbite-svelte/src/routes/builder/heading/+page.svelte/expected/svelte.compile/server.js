import * as $ from 'svelte/internal/server';
import { Heading, Button, Label, Radio, Input, CloseButton, uiHelpers } from "$lib";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// MetaTag
		let breadcrumb_title = "Heading builder";

		let description = "A quick way to create Heading component";
		let title = "Heading builder";
		let dir = "builder";
		const tags = ["h1", "h2", "h3", "h4", "h5", "h6"];
		let headingTag = "h1";
		let headingCls = "text-primary-700 dark:text-primary-500";

		const changeHeadingCls = () => {
			headingCls = headingCls === "text-primary-700 dark:text-primary-500"
				? "text-blue-500 dark:text-blue-400 uppercase italic underline text-center font-semibold bg-gray-50 dark:bg-gray-700 p-4"
				: "text-primary-700 dark:text-primary-500";
		};

		let { text = "My heading" } = $$props;

		// code generator
		let generatedCode = $.derived(() => (() => {
			let props = [];

			if (headingTag) props.push(` tag="${headingTag}"`);
			if (headingCls) props.push(` class="${headingCls}"`);

			const propsString = props.length > 0
				? props.map((prop) => `\n  ${prop}`).join("") + "\n"
				: "";

			return `<Heading${propsString}>
  ${text}
</Headin>`;
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
					$$renderer.push(`<!---->Heading Builder`);
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
							class: 'text-md mb-2',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Edit heading`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						{
							function right($$renderer) {
								CloseButton($$renderer, { onclick: () => text = "" });
							}

							Input($$renderer, {
								type: 'text',
								placeholder: 'Write your blockquote text',
								class: 'mb-8 pr-12',
								get value() {
									return text;
								},

								set value($$value) {
									text = $$value;
									$$settled = false;
								},
								right,
								$$slots: { right: true }
							});
						}

						$$renderer.push(`<!----> <div class="h-24">`);

						Heading($$renderer, {
							tag: headingTag,
							class: headingCls,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(text)}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div> <div class="mb-4 flex flex-wrap space-x-2">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Rounded`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array = $.ensure_array_like(tags);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let tag = each_array[$$index];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-12" },
								name: 'tag',
								value: tag,
								get group() {
									return headingTag;
								},

								set group($$value) {
									headingTag = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(tag)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start">`);

						Button($$renderer, {
							class: 'w-40',
							color: 'blue',
							onclick: changeHeadingCls,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(headingCls !== "text-primary-700 dark:text-primary-500" ? "Original class" : "Change class")}`);
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
		$.bind_props($$props, { text });
	});
}