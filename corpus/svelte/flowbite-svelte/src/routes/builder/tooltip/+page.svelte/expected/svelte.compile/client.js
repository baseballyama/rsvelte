import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Tooltip, tooltip, Radio, Label, uiHelpers } from "$lib";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

var root = $.from_html(`<div class="my-4 flex justify-center"><!> <!></div> <div class="mb-4 flex flex-wrap space-x-2"><!> <!></div> <div class="mb-4 flex flex-wrap space-x-2"><!> <!></div> <div class="mb-4"><!> <span class="mx-2"> </span> <!></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start"><!> <!></div>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	const binding_group_1 = [];

	// MetaTag
	let breadcrumb_title = "Tooltip builder";

	let description = "A quick way to create Tooltip component";
	let title = "Tooltip builder";
	let dir = "builder";

	// for interactive code builder
	// const position: Placement = Object.keys(tooltip.variants.position);
	const placements = [
		"top",
		"right",
		"bottom",
		"left",
		"top-start",
		"top-end",
		"right-start",
		"right-end",
		"bottom-start",
		"bottom-end",
		"left-start",
		"left-end"
	];

	let placement = $.state("top");
	const colors = Object.keys(tooltip.variants.color);
	let color = $.state(void 0);
	let tooltipClass = $.state("");

	const changeClass = () => {
		$.set(tooltipClass, $.get(tooltipClass) === "" ? "p-4" : "", true);
	};

	let arrow = $.state(true);

	const changeArrow = () => {
		$.set(arrow, !$.get(arrow));
	};

	let offset = $.state(6);

	function increaseOffset() {
		$.set(offset, $.get(offset) + 2);
	}

	function decreaseOffset() {
		if ($.get(offset) > 0) {
			$.set(offset, $.get(offset) - 2);
		}
	}

	// code generator
	let generatedCode = $.derived(() => (() => {
		let props = [];

		if ($.get(arrow) !== true) props.push(`arrow="${$.get(arrow)}"`);
		if ($.get(color)) props.push(`color="${$.get(color)}"`);
		if ($.get(placement) !== "top") props.push(`placement="${$.get(placement)}"`);
		if ($.get(offset)) props.push(`offset={${$.get(offset)}}`);
		if ($.get(tooltipClass) !== "") props.push(`class="${$.get(tooltipClass)}"`);

		const propsString = props.length > 0
			? props.map((prop) => `\n  ${prop}`).join("") + "\n"
			: "";

		return `<Button id="type-1" class="m-8">Tooltip trigger</Button>\n<Tooltip${propsString}  triggeredBy="#type-1">Tooltip content</Tooltip>`;
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

			var text = $.text('Tooltip Builder');

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
				var fragment_2 = root();
				var div = $.first_child(fragment_2);
				var node_3 = $.child(div);

				Button(node_3, {
					id: 'type-1',
					class: 'm-8',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Tooltip trigger');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				var node_4 = $.sibling(node_3, 2);

				Tooltip(node_4, {
					triggeredBy: '#type-1',
					get color() {
						return $.get(color);
					},

					get placement() {
						return $.get(placement);
					},

					get arrow() {
						return $.get(arrow);
					},

					get offset() {
						return $.get(offset);
					},

					get class() {
						return $.get(tooltipClass);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('Tooltip content');

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

						var text_3 = $.text('Color');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});

				var node_6 = $.sibling(node_5, 2);

				$.each(node_6, 17, () => colors, $.index, ($$anchor, colorOption) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-24" },
						name: 'color',
						get color() {
							return $.get(colorOption);
						},

						get value() {
							return $.get(colorOption);
						},

						get group() {
							return $.get(color);
						},

						set group($$value) {
							$.set(color, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text();

							$.template_effect(() => $.set_text(text_4, $.get(colorOption)));
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

						var text_5 = $.text('Position');

						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});

				var node_8 = $.sibling(node_7, 2);

				$.each(node_8, 17, () => placements, $.index, ($$anchor, option) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-32" },
						name: 'interactive_toast_position',
						get value() {
							return $.get(option);
						},

						get group() {
							return $.get(placement);
						},

						set group($$value) {
							$.set(placement, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text();

							$.template_effect(() => $.set_text(text_6, $.get(option)));
							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_2);

				var div_3 = $.sibling(div_2, 2);
				var node_9 = $.child(div_3);

				Button(node_9, {
					onclick: decreaseOffset,
					class: 'rounded border p-1',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_7 = $.text('-');

						$.append($$anchor, text_7);
					},
					$$slots: { default: true }
				});

				var span = $.sibling(node_9, 2);
				var text_8 = $.only_child(span);
				var node_10 = $.sibling(span, 2);

				Button(node_10, {
					onclick: increaseOffset,
					class: 'rounded border p-1',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_9 = $.text('+');

						$.append($$anchor, text_9);
					},
					$$slots: { default: true }
				});

				$.reset(div_3);

				var div_4 = $.sibling(div_3, 2);
				var node_11 = $.child(div_4);

				Button(node_11, {
					class: 'w-36',
					onclick: changeClass,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_10 = $.text();

						$.template_effect(() => $.set_text(text_10, $.get(tooltipClass) ? "Remove class" : "Add class"));
						$.append($$anchor, text_10);
					},
					$$slots: { default: true }
				});

				var node_12 = $.sibling(node_11, 2);

				Button(node_12, {
					class: 'w-36',
					color: 'secondary',
					onclick: changeArrow,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_11 = $.text();

						$.template_effect(() => $.set_text(text_11, $.get(arrow) ? "Remove arrow" : "Add arrow"));
						$.append($$anchor, text_11);
					},
					$$slots: { default: true }
				});

				$.reset(div_4);
				$.template_effect(() => $.set_text(text_8, `Offset: ${$.get(offset) ?? ''}px`));
				$.append($$anchor, fragment_2);
			},
			$$slots: { codeblock: true, default: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}