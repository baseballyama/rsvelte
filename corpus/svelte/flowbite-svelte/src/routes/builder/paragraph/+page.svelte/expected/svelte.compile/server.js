import * as $ from 'svelte/internal/server';

import {
	P,
	paragraph,
	Label,
	Radio,
	Button,
	Input,
	CloseButton,
	uiHelpers
} from "$lib";

import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// MetaTag
		let breadcrumb_title = "Paragraph builder";

		let description = "A quick way to create Paragraph component";
		let title = "Paragraph builder";
		let dir = "builder";
		const sizes = Object.keys(paragraph.variants.size);
		let pSize = "base";
		const weights = Object.keys(paragraph.variants.weight);
		let pWeight = "normal";
		const spaces = Object.keys(paragraph.variants.space);
		let pSpace = "normal";
		const heights = Object.keys(paragraph.variants.height);
		let pHeight = "normal";
		const alignments = Object.keys(paragraph.variants.align);
		let pAlign = "left";
		const whitespaces = Object.keys(paragraph.variants.whitespace);
		let pWhitespace = "normal";
		let pFirstupper = false;
		let pJustify = false;
		let italic = false;

		const changeItalic = () => {
			italic = !italic;
		};

		let { text = "" } = $$props;

		text = "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Nulla eius debitis cupiditate tempora necessitatibus perspiciatis pariatur aspernatur.";

		// code generator
		let generatedCode = $.derived(() => (() => {
			let props = [];

			if (pSize !== "base") props.push(` size="${pSize}"`);
			if (pWeight !== "normal") props.push(` weight="${pWeight}"`);
			if (pSpace !== "normal") props.push(` space="${pSpace}"`);
			if (pHeight !== "normal") props.push(` height="${pHeight}"`);
			if (pAlign !== "left") props.push(` align="${pAlign}"`);
			if (pWhitespace !== "normal") props.push(` whitespace="${pWhitespace}"`);
			if (italic) props.push(` italic`);
			if (pFirstupper) props.push(` firstUpper`);
			if (pJustify) props.push(` justify`);

			const propsString = props.length > 0
				? props.map((prop) => `\n  ${prop}`).join("") + "\n"
				: "";

			return `<P${propsString}>
  ${text}
</P>`;
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
					$$renderer.push(`<!---->Paragraph Builder`);
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
								$$renderer.push(`<!---->Edit paragraph`);
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

						$$renderer.push(`<!----> <div class="mb-4 overflow-auto md:h-[200px]">`);

						P($$renderer, {
							contenteditable: true,
							weight: pWeight,
							size: pSize,
							space: pSpace,
							height: pHeight,
							align: pAlign,
							whitespace: pWhitespace,
							italic,
							firstUpper: pFirstupper,
							justify: pJustify,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(text)}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div> <div class="mb-4 flex flex-wrap space-x-4">`);

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
							let size = each_array[$$index];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-12" },
								name: 'p_size',
								value: size,
								get group() {
									return pSize;
								},

								set group($$value) {
									pSize = $$value;
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
								$$renderer.push(`<!---->Weight`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array_1 = $.ensure_array_like(weights);

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let weight = each_array_1[$$index_1];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-20" },
								name: 'p_weight',
								value: weight,
								get group() {
									return pWeight;
								},

								set group($$value) {
									pWeight = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(weight)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="mb-4 flex flex-wrap space-x-2">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Space(Tracking)`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array_2 = $.ensure_array_like(spaces);

						for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
							let space = each_array_2[$$index_2];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-20" },
								name: 'p_space',
								value: space,
								get group() {
									return pSpace;
								},

								set group($$value) {
									pSpace = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(space)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="mb-4 flex flex-wrap space-x-4">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Height(Leading)`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array_3 = $.ensure_array_like(heights);

						for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
							let height = each_array_3[$$index_3];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-16" },
								name: 'p_height',
								value: height,
								get group() {
									return pHeight;
								},

								set group($$value) {
									pHeight = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(height)}`);
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

						const each_array_4 = $.ensure_array_like(alignments);

						for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
							let align = each_array_4[$$index_4];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-20" },
								name: 'p_align',
								onchange: () => pJustify = false,
								value: align,
								get group() {
									return pAlign;
								},

								set group($$value) {
									pAlign = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(align)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="mb-4 flex flex-wrap space-x-4">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Whitespace`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array_5 = $.ensure_array_like(whitespaces);

						for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
							let whitespace = each_array_5[$$index_5];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-16" },
								name: 'p_whitespace',
								value: whitespace,
								get group() {
									return pWhitespace;
								},

								set group($$value) {
									pWhitespace = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(whitespace)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start">`);

						Button($$renderer, {
							class: 'w-40',
							onclick: () => pFirstupper = !pFirstupper,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(pFirstupper ? "Remove upper" : "First upper")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'secondary',
							onclick: () => {
								pJustify = !pJustify;
								pAlign = "left";
							},

							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(pJustify ? "Remove justify" : "Justify")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'emerald',
							onclick: changeItalic,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(italic ? "Remove italic" : "Italic")}`);
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