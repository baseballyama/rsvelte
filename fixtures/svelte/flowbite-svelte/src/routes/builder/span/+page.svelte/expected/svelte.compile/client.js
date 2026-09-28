import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	P,
	Span,
	span,
	Button,
	Label,
	Radio,
	Input,
	CloseButton,
	uiHelpers
} from "$lib";

import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

var root = $.from_html(`Lorem ipsum <!> consectetur elit.`, 1);
var root_1 = $.from_html(`<div class="h-40"><div class=" mb-4"><!> <!></div> <!></div> <div class="mt-4 mb-4 flex flex-wrap space-x-2"><!> <!></div> <div class="mb-4 flex flex-wrap space-x-2"><!> <!></div> <div class="mb-4 flex flex-wrap space-x-2"><!> <!></div> <div class="mb-4 flex flex-wrap space-x-2"><!> <!></div> <div class="mb-4 flex flex-wrap space-x-2"><!> <!></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start"><!> <!> <!> <!> <!></div>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	const binding_group_1 = [];
	const binding_group_2 = [];
	const binding_group_3 = [];
	const binding_group_4 = [];

	// MetaTag
	let breadcrumb_title = "Span builder";

	let description = "A quick way to create Span component";
	let title = "Span builder";
	let dir = "builder";
	let editableContent = $.prop($$props, 'editableContent', 15, "span content");
	let spanItalic = $.state(false);

	const changeItalic = () => {
		$.set(spanItalic, !$.get(spanItalic));
	};

	let spanUnderline = $.state(false);

	const changeUnderline = () => {
		$.set(spanUnderline, !$.get(spanUnderline));
		$.set(spanDecorationColor, "none");
		$.set(spanDecorationThickness, "0");
		$.set(spanDecoration, "none");
		$.set(spanLinethrough, false);
	};

	let spanLinethrough = $.state(false);

	const changeLinethrough = () => {
		$.set(spanLinethrough, !$.get(spanLinethrough));
		$.set(spanUnderline, false);
		$.set(spanDecorationColor, "none");
		$.set(spanDecorationThickness, "0");
		$.set(spanDecoration, "none");
		$.set(spanGradient, "none");
	};

	let spanUppercase = $.state(false);

	const changeUppercase = () => {
		$.set(spanUppercase, !$.get(spanUppercase));
	};

	const gradients = Object.keys(span.variants.gradient);
	let spanGradient = $.state("none");
	let spanHighlight = $.state("none");
	const highlights = Object.keys(span.variants.highlight);
	let spanDecoration = $.state("none");
	const decorations = Object.keys(span.variants.decoration);
	let spanDecorationColor = $.state("none");
	const decorationColors = Object.keys(span.variants.decorationColor);
	let spanDecorationThickness = $.state("0");
	const docrationThickness = Object.keys(span.variants.decorationThickness);
	let opacityClass = $.state("");

	const changeOpacity = () => {
		$.set(opacityClass, $.get(opacityClass) === "" ? "text-gray-600/50 dark:text-gray-500/50" : "", true);
		$.set(spanHighlight, "none");
		$.set(spanGradient, "none");
	};

	// let editableContent = $state('Click to edit content.')
	// code generator
	let generatedCode = $.derived(() => (() => {
		let props = [];

		if ($.get(spanItalic)) props.push(` italic`);
		if ($.get(spanUnderline)) props.push(` underline`);
		if ($.get(spanLinethrough)) props.push(` linethrough`);
		if ($.get(spanUppercase)) props.push(` uppercase`);
		if ($.get(spanGradient) !== "none") props.push(` gradient="${$.get(spanGradient)}"`);
		if ($.get(spanHighlight) !== "none") props.push(` highlight="${$.get(spanHighlight)}"`);
		if ($.get(spanDecoration) !== "none") props.push(` decoration="${$.get(spanDecoration)}"`);
		if ($.get(spanDecorationColor) !== "none") props.push(` decorationColor="${$.get(spanDecorationColor)}"`);
		if ($.get(spanDecorationThickness) !== "0") props.push(` decorationThickness="${$.get(spanDecorationThickness)}"`);

		const propsString = props.length > 0
			? props.map((prop) => `\n  ${prop}`).join("") + "\n"
			: "";

		return `<P size="xl" weight="bold">
  Lorem ipsum 
  <Span${propsString}>${editableContent()}</Span>
  consectetur elit.
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

	var fragment = root_2();
	var node = $.first_child(fragment);

	MetaTag(node, { breadcrumb_title, description, title, dir });

	var node_1 = $.sibling(node, 2);

	H1(node_1, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Span Builder');

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
				var fragment_2 = root_1();
				var div = $.first_child(fragment_2);
				var div_1 = $.child(div);
				var node_3 = $.child(div_1);

				Label(node_3, {
					class: 'mr-4 text-lg font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Edit span content:');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				var node_4 = $.sibling(node_3, 2);

				{
					const right = ($$anchor) => {
						CloseButton($$anchor, { onclick: () => editableContent("") });
					};

					Input(node_4, {
						type: 'text',
						placeholder: 'Write your blockquote text',
						class: 'mb-4 pr-12',
						get value() {
							return editableContent();
						},

						set value($$value) {
							editableContent($$value);
						},
						right,
						$$slots: { right: true }
					});
				}

				$.reset(div_1);

				var node_5 = $.sibling(div_1, 2);

				P(node_5, {
					size: 'xl',
					weight: 'bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var fragment_4 = root();
						var node_6 = $.sibling($.first_child(fragment_4));

						Span(node_6, {
							get italic() {
								return $.get(spanItalic);
							},

							get underline() {
								return $.get(spanUnderline);
							},

							get linethrough() {
								return $.get(spanLinethrough);
							},

							get uppercase() {
								return $.get(spanUppercase);
							},

							get gradient() {
								return $.get(spanGradient);
							},

							get decoration() {
								return $.get(spanDecoration);
							},

							get decorationColor() {
								return $.get(spanDecorationColor);
							},

							get decorationThickness() {
								return $.get(spanDecorationThickness);
							},

							get highlight() {
								return $.get(spanHighlight);
							},

							get class() {
								return $.get(opacityClass);
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text();

								$.template_effect(() => $.set_text(text_2, editableContent()));
								$.append($$anchor, text_2);
							},
							$$slots: { default: true }
						});

						$.next();
						$.append($$anchor, fragment_4);
					},
					$$slots: { default: true }
				});

				$.reset(div);

				var div_2 = $.sibling(div, 2);
				var node_7 = $.child(div_2);

				Label(node_7, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('Highlight');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});

				var node_8 = $.sibling(node_7, 2);

				$.each(node_8, 17, () => highlights, $.index, ($$anchor, highlight) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-20" },
						name: 'span_highlight',
						onchange: () => {
							$.set(spanGradient, "none");
							$.set(opacityClass, "");
						},

						get color() {
							return $.get(highlight);
						},

						get value() {
							return $.get(highlight);
						},

						get group() {
							return $.get(spanHighlight);
						},

						set group($$value) {
							$.set(spanHighlight, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text();

							$.template_effect(() => $.set_text(text_4, $.get(highlight)));
							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_2);

				var div_3 = $.sibling(div_2, 2);
				var node_9 = $.child(div_3);

				Label(node_9, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text('Gradient');

						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});

				var node_10 = $.sibling(node_9, 2);

				$.each(node_10, 17, () => gradients, $.index, ($$anchor, gradient) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-40" },
						name: 'span_gradient',
						onchange: () => $.set(spanHighlight, "none"),
						get value() {
							return $.get(gradient);
						},

						get group() {
							return $.get(spanGradient);
						},

						set group($$value) {
							$.set(spanGradient, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text();

							$.template_effect(() => $.set_text(text_6, $.get(gradient)));
							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_3);

				var div_4 = $.sibling(div_3, 2);
				var node_11 = $.child(div_4);

				Label(node_11, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_7 = $.text('Decoration thickness');

						$.append($$anchor, text_7);
					},
					$$slots: { default: true }
				});

				var node_12 = $.sibling(node_11, 2);

				$.each(node_12, 17, () => docrationThickness, $.index, ($$anchor, thickness) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-16" },
						name: 'span_decoration_thickness',
						onchange: () => {
							$.set(spanUnderline, false);
							$.set(spanLinethrough, false);
						},

						get value() {
							return $.get(thickness);
						},

						get group() {
							return $.get(spanDecorationThickness);
						},

						set group($$value) {
							$.set(spanDecorationThickness, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text();

							$.template_effect(() => $.set_text(text_8, $.get(thickness)));
							$.append($$anchor, text_8);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_4);

				var div_5 = $.sibling(div_4, 2);
				var node_13 = $.child(div_5);

				Label(node_13, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_9 = $.text('Decoration color');

						$.append($$anchor, text_9);
					},
					$$slots: { default: true }
				});

				var node_14 = $.sibling(node_13, 2);

				$.each(node_14, 17, () => decorationColors, $.index, ($$anchor, color) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-24" },
						name: 'p_decoration_color',
						onchange: () => {
							$.set(spanUnderline, false);
							$.set(spanLinethrough, false);
						},

						get color() {
							return $.get(color);
						},

						get value() {
							return $.get(color);
						},

						get group() {
							return $.get(spanDecorationColor);
						},

						set group($$value) {
							$.set(spanDecorationColor, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_10 = $.text();

							$.template_effect(() => $.set_text(text_10, $.get(color)));
							$.append($$anchor, text_10);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_5);

				var div_6 = $.sibling(div_5, 2);
				var node_15 = $.child(div_6);

				Label(node_15, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_11 = $.text('Decoration');

						$.append($$anchor, text_11);
					},
					$$slots: { default: true }
				});

				var node_16 = $.sibling(node_15, 2);

				$.each(node_16, 17, () => decorations, $.index, ($$anchor, decoration) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-20" },
						name: 'span_decoration',
						onchange: () => {
							$.set(spanUnderline, false);
							$.set(spanLinethrough, false);
						},

						get value() {
							return $.get(decoration);
						},

						get group() {
							return $.get(spanDecoration);
						},

						set group($$value) {
							$.set(spanDecoration, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_12 = $.text();

							$.template_effect(() => $.set_text(text_12, $.get(decoration)));
							$.append($$anchor, text_12);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_6);

				var div_7 = $.sibling(div_6, 2);
				var node_17 = $.child(div_7);

				Button(node_17, {
					class: 'w-36',
					color: 'violet',
					onclick: changeLinethrough,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_13 = $.text();

						$.template_effect(() => $.set_text(text_13, $.get(spanLinethrough) ? "No linethrough" : "Linethrough "));
						$.append($$anchor, text_13);
					},
					$$slots: { default: true }
				});

				var node_18 = $.sibling(node_17, 2);

				Button(node_18, {
					class: 'w-36',
					color: 'blue',
					onclick: changeUppercase,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_14 = $.text();

						$.template_effect(() => $.set_text(text_14, $.get(spanUppercase) ? "No uppercase" : "Uppercase"));
						$.append($$anchor, text_14);
					},
					$$slots: { default: true }
				});

				var node_19 = $.sibling(node_18, 2);

				Button(node_19, {
					class: 'w-24',
					onclick: changeItalic,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_15 = $.text();

						$.template_effect(() => $.set_text(text_15, $.get(spanItalic) ? "No italic" : "Italic"));
						$.append($$anchor, text_15);
					},
					$$slots: { default: true }
				});

				var node_20 = $.sibling(node_19, 2);

				Button(node_20, {
					class: 'w-28',
					color: 'amber',
					onclick: changeUnderline,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_16 = $.text();

						$.template_effect(() => $.set_text(text_16, $.get(spanUnderline) ? "No underline" : "Underline"));
						$.append($$anchor, text_16);
					},
					$$slots: { default: true }
				});

				var node_21 = $.sibling(node_20, 2);

				Button(node_21, {
					class: 'w-32',
					color: 'teal',
					onclick: changeOpacity,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_17 = $.text();

						$.template_effect(() => $.set_text(text_17, $.get(opacityClass) ? "No opacity" : "Add opacity"));
						$.append($$anchor, text_17);
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