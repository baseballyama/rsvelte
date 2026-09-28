import * as $ from 'svelte/internal/server';

import {
	Label,
	Fileupload,
	fileupload,
	Helper,
	Radio,
	Button,
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
		let breadcrumb_title = "File input builder";

		let description = "A quick way to create File input component";
		let title = "File input builder";
		let dir = "builder";
		let files = void 0;
		const sizes = Object.keys(fileupload.variants.size);
		let size = "md";
		let helperState = false;

		const changeHelperState = () => {
			helperState = !helperState;
		};

		let fileNames = true;

		const changeBindFile = () => {
			fileNames = !fileNames;
		};

		let multiple = false;

		const changeMultiple = () => {
			multiple = !multiple;
		};

		// code generator
		let generatedCode = $.derived(() => (() => {
			let props = [];

			if (size !== "md") props.push(` size="${size}"`);
			if (multiple) props.push(" multiple");
			if (fileNames) props.push(" bind:files");

			const propsString = props.length > 0
				? props.map((prop) => `\n  ${prop}`).join("") + "\n"
				: "";

			return `<Fileupload${propsString} />${helperState ? `\n<Helper>Helper text</Helper>` : ""}
${fileNames ? `{#each files as file}<p>{file.name}</p>{/each}` : ""}`;
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
					$$renderer.push(`<!---->File input Builder`);
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
						$$renderer.push(`<div class="md:h-24">`);

						Fileupload($$renderer, {
							id: 'small_size',
							size,
							class: 'mb-2',
							multiple,
							get files() {
								return files;
							},

							set files($$value) {
								files = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						if (helperState) {
							$$renderer.push('<!--[0-->');

							Helper($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->SVG, PNG, JPG or GIF (MAX. 800x400px).`);
								},
								$$slots: { default: true }
							});
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (fileNames && files) {
							$$renderer.push(`<!--[0--><div class="h-16 overflow-y-scroll"><!--[-->`);

							const each_array = $.ensure_array_like(files);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let file = each_array[$$index];

								$$renderer.push(`<p>${$.escape(file.name)}</p>`);
							}

							$$renderer.push(`<!--]--></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div> <div class="mt-4 mb-4 flex flex-wrap space-x-2">`);

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
							let sizeOption = each_array_1[$$index_1];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-16" },
								name: 'file_input_size',
								value: sizeOption,
								get group() {
									return size;
								},

								set group($$value) {
									size = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(sizeOption)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start">`);

						Button($$renderer, {
							class: 'w-40',
							onclick: changeHelperState,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(helperState ? "Remove helper" : "Add helper")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'emerald',
							onclick: changeBindFile,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(fileNames ? "Hide file names" : "Show file names")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'sky',
							onclick: changeMultiple,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(multiple ? "Remove multiple" : "Add multiple")}`);
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