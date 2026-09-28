import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Indicator, indicator, Button, Label, Radio, uiHelpers } from "$lib";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

var root = $.from_html(`<div class="borer relative h-56 w-56 rounded-lg border-gray-300 bg-gray-200 dark:border-gray-700 dark:bg-gray-800"><!></div> <div class="mt-8 space-y-4"><div class="flex flex-wrap space-x-2"><!> <!></div> <div class="flex flex-wrap space-x-4"><!> <!></div> <div class="flex flex-wrap space-x-4"><!> <!></div> <!> <!></div>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	const binding_group_1 = [];
	const binding_group_2 = [];

	// MetaTag
	let breadcrumb_title = "Indicator builder";

	let description = "A quick way to create Indicator component";
	let title = "Indicator builder";
	let dir = "builder";

	// color, size, rounded, border, placement and offset
	const sizes = Object.keys(indicator.variants.size);

	const colors = Object.keys(indicator.variants.color);
	const placements = Object.keys(indicator.variants.placement);
	let color = $.state("primary");
	let size = $.state("md");
	let border = $.state(false);

	const changeBorder = () => {
		$.set(border, !$.get(border));
	};

	let cornerStyle = $.state("circular");

	const changeCornerStyle = () => {
		$.set(cornerStyle, $.get(cornerStyle) === "circular" ? "rounded" : "circular", true);
	};

	let placement = $.state("default");

	// code generator
	let generatedCode = $.derived(() => (() => {
		let props = [];

		// {color} {size} {border} {placement} {cornerStyle}
		// color = 'primary', cornerStyle = 'circular', size = 'md', border = false, placement, offset = true,
		// if (color) props.push(` color="${color}"`);
		if ($.get(color) !== "primary") props.push(` color="${$.get(color)}"`);

		if ($.get(size) !== "md") props.push(` size="${$.get(size)}"`);
		if ($.get(border)) props.push(" border");
		if ($.get(placement) !== "default") props.push(` placement="${$.get(placement)}"`);
		if ($.get(cornerStyle) !== "circular") props.push(` cornerStyle="${$.get(cornerStyle)}"`);

		const propsString = props.length > 0
			? props.map((prop) => `\n  ${prop}`).join("") + "\n"
			: "";

		return `<div class="borer relative h-56 w-56 rounded-lg border-gray-300 m-8">
  <Indicator${propsString} />
</div>`;
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

			var text = $.text('Indicator Builder');

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

				Indicator(node_3, {
					get color() {
						return $.get(color);
					},

					get size() {
						return $.get(size);
					},

					get border() {
						return $.get(border);
					},

					get placement() {
						return $.get(placement);
					},

					get cornerStyle() {
						return $.get(cornerStyle);
					}
				});

				$.reset(div);

				var div_1 = $.sibling(div, 2);
				var div_2 = $.child(div_1);
				var node_4 = $.child(div_2);

				Label(node_4, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Color');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				var node_5 = $.sibling(node_4, 2);

				$.each(node_5, 17, () => colors, $.index, ($$anchor, colorOption) => {
					Radio($$anchor, {
						classes: { label: "w-24 my-1" },
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

							var text_2 = $.text();

							$.template_effect(() => $.set_text(text_2, $.get(colorOption)));
							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_2);

				var div_3 = $.sibling(div_2, 2);
				var node_6 = $.child(div_3);

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
						classes: { label: "w-24" },
						name: 'size',
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

				$.reset(div_3);

				var div_4 = $.sibling(div_3, 2);
				var node_8 = $.child(div_4);

				Label(node_8, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text('Placement');

						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});

				var node_9 = $.sibling(node_8, 2);

				$.each(node_9, 17, () => placements, $.index, ($$anchor, positionOption) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-32" },
						name: 'placement',
						get value() {
							return $.get(positionOption);
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

							$.template_effect(() => $.set_text(text_6, $.get(positionOption)));
							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_4);

				var node_10 = $.sibling(div_4, 2);

				Button(node_10, {
					onclick: changeBorder,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_7 = $.text();

						$.template_effect(() => $.set_text(text_7, $.get(border) ? "Remove border" : "Add border"));
						$.append($$anchor, text_7);
					},
					$$slots: { default: true }
				});

				var node_11 = $.sibling(node_10, 2);

				Button(node_11, {
					onclick: changeCornerStyle,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_8 = $.text();

						$.template_effect(() => $.set_text(text_8, $.get(cornerStyle) === "circular" ? "Rounded" : "Circular"));
						$.append($$anchor, text_8);
					},
					$$slots: { default: true }
				});

				$.reset(div_1);
				$.append($$anchor, fragment_2);
			},
			$$slots: { codeblock: true, default: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}