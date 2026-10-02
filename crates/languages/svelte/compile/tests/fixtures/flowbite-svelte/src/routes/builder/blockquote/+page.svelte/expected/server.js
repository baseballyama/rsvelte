import * as $ from 'svelte/internal/server';

import {
	Blockquote,
	blockquote,
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
		let breadcrumb_title = "Blockquote builder";

		let description = "A quick way to create Blockquote component";
		let title = "Blockquote builder";
		let dir = "builder";

		let {
			text = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur quas commodi accusamus dignissimos qui totam iste rem necessitatibus? Cumque minus et animi nostrum deserunt provident excepturi laboriosam ipsum minima nisi!"
		} = $$props;

		const sizes = Object.keys(blockquote.variants.size);
		let selectedSize = "lg";
		const alignments = Object.keys(blockquote.variants.alignment);
		let selectedAlignment = "left";
		let border = false;

		const changeBorder = () => {
			border = !border;
		};

		let italic = false;

		const changeItalic = () => {
			italic = !italic;
		};

		let bg = false;

		const changeBg = () => {
			bg = !bg;
		};

		let blockClass = "p-8";

		const changeClass = () => {
			blockClass = blockClass === "p-8" ? "p-4" : "p-8";
		};

		// code generator
		let generatedCode = $.derived(() => (() => {
			let props = [];

			if (bg) props.push(" bg");
			if (border) props.push(" border");
			if (italic) props.push(" italic");
			if (selectedAlignment !== "left") props.push(` alignment="${selectedAlignment}"`);

			// blockClass
			if (blockClass) props.push(` class="${blockClass}"`);

			if (selectedSize !== "lg") props.push(` size="${selectedSize}"`);

			const propsString = props.length > 0
				? props.map((prop) => `\n  ${prop}`).join("") + "\n"
				: "";

			return `<Blockquote${propsString}>
  ${text}
</Blockquote>`;
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
					$$renderer.push(`<!---->Blockquote Builder`);
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

						$$renderer.push(`<!----> <div class="mb-4 h-[300px] overflow-y-auto md:h-[250px]">`);

						Blockquote($$renderer, {
							border,
							italic,
							size: selectedSize,
							bg,
							alignment: selectedAlignment,
							class: blockClass,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(text)}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div> <div class="mb-4 flex flex-wrap space-x-2">`);

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
								classes: { label: "w-16" },
								name: 'block_size',
								value: size,
								get group() {
									return selectedSize;
								},

								set group($$value) {
									selectedSize = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(size)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="mb-4 flex flex-wrap space-x-2">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Alignment`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array_1 = $.ensure_array_like(alignments);

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let alignment = each_array_1[$$index_1];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-16" },
								name: 'block_alignment',
								value: alignment,
								get group() {
									return selectedAlignment;
								},

								set group($$value) {
									selectedAlignment = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(alignment)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start">`);

						Button($$renderer, {
							class: 'w-40',
							color: 'blue',
							onclick: changeBorder,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(border ? "Remove border" : "Add border")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'rose',
							onclick: changeItalic,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(italic ? "Remove italic" : "Add italic")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'indigo',
							onclick: changeBg,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(bg ? "Remove bg" : "Add bg")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'sky',
							onclick: changeClass,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(blockClass === "p-8" ? "class: p-4" : "class: p-8")}`);
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