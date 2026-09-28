import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var root = $.from_html(`<!> <div class="mb-4 h-[300px] overflow-y-auto md:h-[250px]"><!></div> <div class="mb-4 flex flex-wrap space-x-2"><!> <!></div> <div class="mb-4 flex flex-wrap space-x-2"><!> <!></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start"><!> <!> <!> <!></div>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	const binding_group_1 = [];

	// MetaTag
	let breadcrumb_title = "Blockquote builder";

	let description = "A quick way to create Blockquote component";
	let title = "Blockquote builder";
	let dir = "builder";
	let text = $.prop($$props, 'text', 15, "Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur quas commodi accusamus dignissimos qui totam iste rem necessitatibus? Cumque minus et animi nostrum deserunt provident excepturi laboriosam ipsum minima nisi!");
	const sizes = Object.keys(blockquote.variants.size);
	let selectedSize = $.state("lg");
	const alignments = Object.keys(blockquote.variants.alignment);
	let selectedAlignment = $.state("left");
	let border = $.state(false);

	const changeBorder = () => {
		$.set(border, !$.get(border));
	};

	let italic = $.state(false);

	const changeItalic = () => {
		$.set(italic, !$.get(italic));
	};

	let bg = $.state(false);

	const changeBg = () => {
		$.set(bg, !$.get(bg));
	};

	let blockClass = $.state("p-8");

	const changeClass = () => {
		$.set(blockClass, $.get(blockClass) === "p-8" ? "p-4" : "p-8", true);
	};

	// code generator
	let generatedCode = $.derived(() => (() => {
		let props = [];

		if ($.get(bg)) props.push(" bg");
		if ($.get(border)) props.push(" border");
		if ($.get(italic)) props.push(" italic");
		if ($.get(selectedAlignment) !== "left") props.push(` alignment="${$.get(selectedAlignment)}"`);

		// blockClass
		if ($.get(blockClass)) props.push(` class="${$.get(blockClass)}"`);

		if ($.get(selectedSize) !== "lg") props.push(` size="${$.get(selectedSize)}"`);

		const propsString = props.length > 0
			? props.map((prop) => `\n  ${prop}`).join("") + "\n"
			: "";

		return `<Blockquote${propsString}>
  ${text()}
</Blockquote>`;
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

			var text_1 = $.text('Blockquote Builder');

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

				{
					const right = ($$anchor) => {
						CloseButton($$anchor, { onclick: () => text("") });
					};

					Input(node_3, {
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

				var div = $.sibling(node_3, 2);
				var node_4 = $.child(div);

				Blockquote(node_4, {
					get border() {
						return $.get(border);
					},

					get italic() {
						return $.get(italic);
					},

					get size() {
						return $.get(selectedSize);
					},

					get bg() {
						return $.get(bg);
					},

					get alignment() {
						return $.get(selectedAlignment);
					},

					get class() {
						return $.get(blockClass);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text();

						$.template_effect(() => $.set_text(text_2, text()));
						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});

				$.reset(div);

				var div_1 = $.sibling(div, 2);
				var node_5 = $.child(div_1);

				Label(node_5, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('Size');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});

				var node_6 = $.sibling(node_5, 2);

				$.each(node_6, 17, () => sizes, $.index, ($$anchor, size) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-16" },
						name: 'block_size',
						get value() {
							return $.get(size);
						},

						get group() {
							return $.get(selectedSize);
						},

						set group($$value) {
							$.set(selectedSize, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text();

							$.template_effect(() => $.set_text(text_4, $.get(size)));
							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_1);

				var div_2 = $.sibling(div_1, 2);
				var node_7 = $.child(div_2);

				Label(node_7, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text('Alignment');

						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});

				var node_8 = $.sibling(node_7, 2);

				$.each(node_8, 17, () => alignments, $.index, ($$anchor, alignment) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-16" },
						name: 'block_alignment',
						get value() {
							return $.get(alignment);
						},

						get group() {
							return $.get(selectedAlignment);
						},

						set group($$value) {
							$.set(selectedAlignment, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text();

							$.template_effect(() => $.set_text(text_6, $.get(alignment)));
							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_2);

				var div_3 = $.sibling(div_2, 2);
				var node_9 = $.child(div_3);

				Button(node_9, {
					class: 'w-40',
					color: 'blue',
					onclick: changeBorder,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_7 = $.text();

						$.template_effect(() => $.set_text(text_7, $.get(border) ? "Remove border" : "Add border"));
						$.append($$anchor, text_7);
					},
					$$slots: { default: true }
				});

				var node_10 = $.sibling(node_9, 2);

				Button(node_10, {
					class: 'w-40',
					color: 'rose',
					onclick: changeItalic,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_8 = $.text();

						$.template_effect(() => $.set_text(text_8, $.get(italic) ? "Remove italic" : "Add italic"));
						$.append($$anchor, text_8);
					},
					$$slots: { default: true }
				});

				var node_11 = $.sibling(node_10, 2);

				Button(node_11, {
					class: 'w-40',
					color: 'indigo',
					onclick: changeBg,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_9 = $.text();

						$.template_effect(() => $.set_text(text_9, $.get(bg) ? "Remove bg" : "Add bg"));
						$.append($$anchor, text_9);
					},
					$$slots: { default: true }
				});

				var node_12 = $.sibling(node_11, 2);

				Button(node_12, {
					class: 'w-40',
					color: 'sky',
					onclick: changeClass,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_10 = $.text();

						$.template_effect(() => $.set_text(text_10, $.get(blockClass) === "p-8" ? "class: p-4" : "class: p-8"));
						$.append($$anchor, text_10);
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