import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<div class="h-16 overflow-y-scroll"></div>`);
var root_2 = $.from_html(`<div class="md:h-24"><!> <!> <!></div> <div class="mt-4 mb-4 flex flex-wrap space-x-2"><!> <!></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start"><!> <!> <!></div>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];

	// MetaTag
	let breadcrumb_title = "File input builder";

	let description = "A quick way to create File input component";
	let title = "File input builder";
	let dir = "builder";
	let files = $.state(void 0);
	const sizes = Object.keys(fileupload.variants.size);
	let size = $.state("md");
	let helperState = $.state(false);

	const changeHelperState = () => {
		$.set(helperState, !$.get(helperState));
	};

	let fileNames = $.state(true);

	const changeBindFile = () => {
		$.set(fileNames, !$.get(fileNames));
	};

	let multiple = $.state(false);

	const changeMultiple = () => {
		$.set(multiple, !$.get(multiple));
	};

	// code generator
	let generatedCode = $.derived(() => (() => {
		let props = [];

		if ($.get(size) !== "md") props.push(` size="${$.get(size)}"`);
		if ($.get(multiple)) props.push(" multiple");
		if ($.get(fileNames)) props.push(" bind:files");

		const propsString = props.length > 0
			? props.map((prop) => `\n  ${prop}`).join("") + "\n"
			: "";

		return `<Fileupload${propsString} />${$.get(helperState) ? `\n<Helper>Helper text</Helper>` : ""}
${$.get(fileNames) ? `{#each files as file}<p>{file.name}</p>{/each}` : ""}`;
	})());

	// for interactive builder
	let builder = uiHelpers();

	let builderExpand = $.state(false);
	let showBuilderExpandButton = $.derived(() => isGeneratedCodeOverflow($.get(generatedCode)));

	const handleBuilderExpandClick = () => {
		$.set(builderExpand, !$.get(builderExpand));
	};

	$.user_effect(() => {
		$.set(builderExpand, builder.isOpen, true);
	});

	var fragment = root_3();
	var node = $.first_child(fragment);

	MetaTag(node, { breadcrumb_title, description, title, dir });

	var node_1 = $.sibling(node, 2);

	H1(node_1, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('File input Builder');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	{
		const codeblock = ($$anchor) => {
			DynamicCodeBlockHighlight($$anchor, {
				handleExpandClick: handleBuilderExpandClick,
				get expand() {
					return $.get(builderExpand);
				},

				get showExpandButton() {
					return $.get(showBuilderExpandButton);
				},

				get code() {
					return $.get(generatedCode);
				}
			});
		};

		CodeWrapper(node_2, {
			codeblock,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root_2();
				var div = $.first_child(fragment_2);
				var node_3 = $.child(div);

				Fileupload(node_3, {
					id: 'small_size',
					get size() {
						return $.get(size);
					},
					class: 'mb-2',
					get multiple() {
						return $.get(multiple);
					},

					get files() {
						return $.get(files);
					},

					set files($$value) {
						$.set(files, $$value, true);
					}
				});

				var node_4 = $.sibling(node_3, 2);

				{
					var consequent = ($$anchor) => {
						Helper($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text('SVG, PNG, JPG or GIF (MAX. 800x400px).');

								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});
					};

					$.if(node_4, ($$render) => {
						if ($.get(helperState)) $$render(consequent);
					});
				}

				var node_5 = $.sibling(node_4, 2);

				{
					var consequent_1 = ($$anchor) => {
						var div_1 = root_1();

						$.each(div_1, 21, () => $.get(files), $.index, ($$anchor, file) => {
							var p = root();
							var text_2 = $.only_child(p, true);

							$.template_effect(() => $.set_text(text_2, $.get(file).name));
							$.append($$anchor, p);
						});

						$.reset(div_1);
						$.append($$anchor, div_1);
					};

					$.if(node_5, ($$render) => {
						if ($.get(fileNames) && $.get(files)) $$render(consequent_1);
					});
				}

				$.reset(div);

				var div_2 = $.sibling(div, 2);
				var node_6 = $.child(div_2);

				Label(node_6, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('Size');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});

				var node_7 = $.sibling(node_6, 2);

				$.each(node_7, 17, () => sizes, $.index, ($$anchor, sizeOption) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-16" },
						name: 'file_input_size',
						get value() {
							return $.get(sizeOption);
						},

						get group() {
							return $.get(size);
						},

						set group($$value) {
							$.set(size, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text();

							$.template_effect(() => $.set_text(text_4, $.get(sizeOption)));
							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_2);

				var div_3 = $.sibling(div_2, 2);
				var node_8 = $.child(div_3);

				Button(node_8, {
					class: 'w-40',
					onclick: changeHelperState,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text();

						$.template_effect(() => $.set_text(text_5, $.get(helperState) ? "Remove helper" : "Add helper"));
						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});

				var node_9 = $.sibling(node_8, 2);

				Button(node_9, {
					class: 'w-40',
					color: 'emerald',
					onclick: changeBindFile,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_6 = $.text();

						$.template_effect(() => $.set_text(text_6, $.get(fileNames) ? "Hide file names" : "Show file names"));
						$.append($$anchor, text_6);
					},
					$$slots: { default: true }
				});

				var node_10 = $.sibling(node_9, 2);

				Button(node_10, {
					class: 'w-40',
					color: 'sky',
					onclick: changeMultiple,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_7 = $.text();

						$.template_effect(() => $.set_text(text_7, $.get(multiple) ? "Remove multiple" : "Add multiple"));
						$.append($$anchor, text_7);
					},
					$$slots: { default: true }
				});

				$.reset(div_3);
				$.append($$anchor, fragment_2);
			},
			$$slots: { codeblock: true, default: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}