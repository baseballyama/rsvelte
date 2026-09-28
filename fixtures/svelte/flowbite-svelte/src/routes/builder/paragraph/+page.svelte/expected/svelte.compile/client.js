import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var root = $.from_html(`<!> <!> <div class="mb-4 overflow-auto md:h-[200px]"><!></div> <div class="mb-4 flex flex-wrap space-x-4"><!> <!></div> <div class="mb-4 flex flex-wrap space-x-4"><!> <!></div> <div class="mb-4 flex flex-wrap space-x-2"><!> <!></div> <div class="mb-4 flex flex-wrap space-x-4"><!> <!></div> <div class="mb-4 flex flex-wrap space-x-4"><!> <!></div> <div class="mb-4 flex flex-wrap space-x-4"><!> <!></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start"><!> <!> <!></div>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	const binding_group_1 = [];
	const binding_group_2 = [];
	const binding_group_3 = [];
	const binding_group_4 = [];
	const binding_group_5 = [];

	// MetaTag
	let breadcrumb_title = "Paragraph builder";

	let description = "A quick way to create Paragraph component";
	let title = "Paragraph builder";
	let dir = "builder";
	const sizes = Object.keys(paragraph.variants.size);
	let pSize = $.state("base");
	const weights = Object.keys(paragraph.variants.weight);
	let pWeight = $.state("normal");
	const spaces = Object.keys(paragraph.variants.space);
	let pSpace = $.state("normal");
	const heights = Object.keys(paragraph.variants.height);
	let pHeight = $.state("normal");
	const alignments = Object.keys(paragraph.variants.align);
	let pAlign = $.state("left");
	const whitespaces = Object.keys(paragraph.variants.whitespace);
	let pWhitespace = $.state("normal");
	let pFirstupper = $.state(false);
	let pJustify = $.state(false);
	let italic = $.state(false);

	const changeItalic = () => {
		$.set(italic, !$.get(italic));
	};

	let text = $.prop($$props, 'text', 15, "");

	text("Lorem ipsum dolor sit, amet consectetur adipisicing elit. Nulla eius debitis cupiditate tempora necessitatibus perspiciatis pariatur aspernatur.");

	// code generator
	let generatedCode = $.derived(() => (() => {
		let props = [];

		if ($.get(pSize) !== "base") props.push(` size="${$.get(pSize)}"`);
		if ($.get(pWeight) !== "normal") props.push(` weight="${$.get(pWeight)}"`);
		if ($.get(pSpace) !== "normal") props.push(` space="${$.get(pSpace)}"`);
		if ($.get(pHeight) !== "normal") props.push(` height="${$.get(pHeight)}"`);
		if ($.get(pAlign) !== "left") props.push(` align="${$.get(pAlign)}"`);
		if ($.get(pWhitespace) !== "normal") props.push(` whitespace="${$.get(pWhitespace)}"`);
		if ($.get(italic)) props.push(` italic`);
		if ($.get(pFirstupper)) props.push(` firstUpper`);
		if ($.get(pJustify)) props.push(` justify`);

		const propsString = props.length > 0
			? props.map((prop) => `\n  ${prop}`).join("") + "\n"
			: "";

		return `<P${propsString}>
  ${text()}
</P>`;
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

	var fragment = root_1();
	var node = $.first_child(fragment);

	MetaTag(node, { breadcrumb_title, description, title, dir });

	var node_1 = $.sibling(node, 2);

	H1(node_1, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Paragraph Builder');

			$.append($$anchor, text_1);
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
				var fragment_2 = root();
				var node_3 = $.first_child(fragment_2);

				Label(node_3, {
					class: 'text-md mb-2',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('Edit paragraph');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});

				var node_4 = $.sibling(node_3, 2);

				{
					const right = ($$anchor) => {
						CloseButton($$anchor, { onclick: () => text("") });
					};

					Input(node_4, {
						type: 'text',
						placeholder: 'Write your blockquote text',
						class: 'mb-8 pr-12',
						get value() {
							return text();
						},

						set value($$value) {
							text($$value);
						},
						right,
						$$slots: { right: true }
					});
				}

				var div = $.sibling(node_4, 2);
				var node_5 = $.child(div);

				P(node_5, {
					contenteditable: true,
					get weight() {
						return $.get(pWeight);
					},

					get size() {
						return $.get(pSize);
					},

					get space() {
						return $.get(pSpace);
					},

					get height() {
						return $.get(pHeight);
					},

					get align() {
						return $.get(pAlign);
					},

					get whitespace() {
						return $.get(pWhitespace);
					},

					get italic() {
						return $.get(italic);
					},

					get firstUpper() {
						return $.get(pFirstupper);
					},

					get justify() {
						return $.get(pJustify);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text();

						$.template_effect(() => $.set_text(text_3, text()));
						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});

				$.reset(div);

				var div_1 = $.sibling(div, 2);
				var node_6 = $.child(div_1);

				Label(node_6, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text('Size');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});

				var node_7 = $.sibling(node_6, 2);

				$.each(node_7, 17, () => sizes, $.index, ($$anchor, size) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-12" },
						name: 'p_size',
						get value() {
							return $.get(size);
						},

						get group() {
							return $.get(pSize);
						},

						set group($$value) {
							$.set(pSize, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text();

							$.template_effect(() => $.set_text(text_5, $.get(size)));
							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_1);

				var div_2 = $.sibling(div_1, 2);
				var node_8 = $.child(div_2);

				Label(node_8, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_6 = $.text('Weight');

						$.append($$anchor, text_6);
					},
					$$slots: { default: true }
				});

				var node_9 = $.sibling(node_8, 2);

				$.each(node_9, 17, () => weights, $.index, ($$anchor, weight) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-20" },
						name: 'p_weight',
						get value() {
							return $.get(weight);
						},

						get group() {
							return $.get(pWeight);
						},

						set group($$value) {
							$.set(pWeight, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text();

							$.template_effect(() => $.set_text(text_7, $.get(weight)));
							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_2);

				var div_3 = $.sibling(div_2, 2);
				var node_10 = $.child(div_3);

				Label(node_10, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_8 = $.text('Space(Tracking)');

						$.append($$anchor, text_8);
					},
					$$slots: { default: true }
				});

				var node_11 = $.sibling(node_10, 2);

				$.each(node_11, 17, () => spaces, $.index, ($$anchor, space) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-20" },
						name: 'p_space',
						get value() {
							return $.get(space);
						},

						get group() {
							return $.get(pSpace);
						},

						set group($$value) {
							$.set(pSpace, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_9 = $.text();

							$.template_effect(() => $.set_text(text_9, $.get(space)));
							$.append($$anchor, text_9);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_3);

				var div_4 = $.sibling(div_3, 2);
				var node_12 = $.child(div_4);

				Label(node_12, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_10 = $.text('Height(Leading)');

						$.append($$anchor, text_10);
					},
					$$slots: { default: true }
				});

				var node_13 = $.sibling(node_12, 2);

				$.each(node_13, 17, () => heights, $.index, ($$anchor, height) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-16" },
						name: 'p_height',
						get value() {
							return $.get(height);
						},

						get group() {
							return $.get(pHeight);
						},

						set group($$value) {
							$.set(pHeight, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_11 = $.text();

							$.template_effect(() => $.set_text(text_11, $.get(height)));
							$.append($$anchor, text_11);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_4);

				var div_5 = $.sibling(div_4, 2);
				var node_14 = $.child(div_5);

				Label(node_14, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_12 = $.text('Alignment');

						$.append($$anchor, text_12);
					},
					$$slots: { default: true }
				});

				var node_15 = $.sibling(node_14, 2);

				$.each(node_15, 17, () => alignments, $.index, ($$anchor, align) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-20" },
						name: 'p_align',
						onchange: () => $.set(pJustify, false),
						get value() {
							return $.get(align);
						},

						get group() {
							return $.get(pAlign);
						},

						set group($$value) {
							$.set(pAlign, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_13 = $.text();

							$.template_effect(() => $.set_text(text_13, $.get(align)));
							$.append($$anchor, text_13);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_5);

				var div_6 = $.sibling(div_5, 2);
				var node_16 = $.child(div_6);

				Label(node_16, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_14 = $.text('Whitespace');

						$.append($$anchor, text_14);
					},
					$$slots: { default: true }
				});

				var node_17 = $.sibling(node_16, 2);

				$.each(node_17, 17, () => whitespaces, $.index, ($$anchor, whitespace) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-16" },
						name: 'p_whitespace',
						get value() {
							return $.get(whitespace);
						},

						get group() {
							return $.get(pWhitespace);
						},

						set group($$value) {
							$.set(pWhitespace, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_15 = $.text();

							$.template_effect(() => $.set_text(text_15, $.get(whitespace)));
							$.append($$anchor, text_15);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_6);

				var div_7 = $.sibling(div_6, 2);
				var node_18 = $.child(div_7);

				Button(node_18, {
					class: 'w-40',
					onclick: () => $.set(pFirstupper, !$.get(pFirstupper)),
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_16 = $.text();

						$.template_effect(() => $.set_text(text_16, $.get(pFirstupper) ? "Remove upper" : "First upper"));
						$.append($$anchor, text_16);
					},
					$$slots: { default: true }
				});

				var node_19 = $.sibling(node_18, 2);

				Button(node_19, {
					class: 'w-40',
					color: 'secondary',
					onclick: () => {
						$.set(pJustify, !$.get(pJustify));
						$.set(pAlign, "left");
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_17 = $.text();

						$.template_effect(() => $.set_text(text_17, $.get(pJustify) ? "Remove justify" : "Justify"));
						$.append($$anchor, text_17);
					},
					$$slots: { default: true }
				});

				var node_20 = $.sibling(node_19, 2);

				Button(node_20, {
					class: 'w-40',
					color: 'emerald',
					onclick: changeItalic,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_18 = $.text();

						$.template_effect(() => $.set_text(text_18, $.get(italic) ? "Remove italic" : "Italic"));
						$.append($$anchor, text_18);
					},
					$$slots: { default: true }
				});

				$.reset(div_7);
				$.append($$anchor, fragment_2);
			},
			$$slots: { codeblock: true, default: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}