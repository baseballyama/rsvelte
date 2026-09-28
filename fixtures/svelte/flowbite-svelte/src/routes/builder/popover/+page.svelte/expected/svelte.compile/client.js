import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { blur, fly, slide, scale, fade } from "svelte/transition";
import { sineIn, linear } from "svelte/easing";
import { Popover, popover, Button, Label, Radio, uiHelpers } from "$lib";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

var root = $.from_html(`<p>And here's some amazing content. It's very engaging. Right?</p>`);
var root_1 = $.from_html(`<div class="flex h-80 items-center justify-center"><!> <!></div> <div class="mb-4 flex flex-wrap space-x-4"><!> <!></div> <div class="mb-4 flex flex-wrap space-x-2"><!> <!></div> <div class="mb-4 flex flex-wrap space-x-2"><!> <!></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start"><!> <!> <!></div>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	const binding_group_1 = [];
	const binding_group_2 = [];

	// MetaTag
	let breadcrumb_title = "Popover builder";

	let description = "A quick way to create Popover component";
	let title = "Popover builder";
	let dir = "builder";

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

	// const positions = Object.keys(popover.variants.position);
	// let position: PopoverProps['position'] = $state(positions[0]) as PopoverProps['position'];
	const colors = Object.keys(popover.variants.color);

	let color = $.state("default");
	let popoverClass = $.state("w-64 text-sm font-light");

	const changeClass = () => {
		$.set(popoverClass, $.get(popoverClass) === "w-64 text-sm font-light" ? "w-64 text-sm font-light" : "w-64 text-sm font-light", true);
	};

	let arrow = $.state(true);

	const changeArrow = () => {
		$.set(arrow, !$.get(arrow));
		$.set(offset, undefined);
	};

	let offset = $.state(void 0);

	const changeOffset = () => {
		$.set(offset, $.get(offset) ?? 8, true);
		$.set(arrow, false);
	};

	// transition
	// color: Drawer['color'];
	const transitions = [
		{
			name: "Fade",
			transition: fade,
			params: { duration: 100, easing: linear }
		},

		{
			name: "Fly",
			transition: fly,
			params: { duration: 300, easing: linear, x: -150 }
		},

		{
			name: "Blur",
			transition: blur,
			params: { duration: 800, easing: sineIn }
		}
	];

	let selectedTransition = $.state("Fade");
	let currentTransition = $.derived(() => transitions.find((t) => t.name === $.get(selectedTransition)) || transitions[0]);

	// code generator
	let generatedCode = $.derived(() => (() => {
		let props = [];

		if ($.get(color) !== "default") props.push(` color="${$.get(color)}"`);
		if ($.get(placement) !== "top") props.push(` placement="${$.get(placement)}"`);
		if ($.get(offset)) props.push(` offset="${$.get(offset)}"`);
		if ($.get(popoverClass) !== "w-64 text-sm font-light") props.push(` class="${$.get(popoverClass)}"`);
		if ($.get(arrow) !== true) props.push(" arrow={false}");

		if ($.get(currentTransition) !== transitions[0]) {
			props.push(` transition={${$.get(currentTransition).name.toLowerCase()}}`);

			const paramsString = Object.entries($.get(currentTransition).params).map(([key, value]) => {
				if (key === "easing") {
					// For easing, use the name of the easing function
					return `${key}:${value.name || "linear"}`;
				}

				// For other values, just use the literal value
				return `${key}:${value}`;
			}).join(",");

			props.push(` params={{${paramsString}}}`);
		}

		const propsString = props.length > 0
			? props.map((prop) => `\n  ${prop}`).join("") + "\n"
			: "";

		return `<Button id="demo">Popover</Button>
<Popover titleSlot="Popover title" triggeredBy="#demo"${propsString} >
  My Popover content
</Popover>`;
	})());

	// end of code generator
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

			var text = $.text('Popover Builder');

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
			class: '',
			codeblock,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root_1();
				var div = $.first_child(fragment_2);
				var node_3 = $.child(div);

				Button(node_3, {
					id: 'b1',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Popover');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				var node_4 = $.sibling(node_3, 2);

				Popover(node_4, {
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
						return $.get(popoverClass);
					},

					get transition() {
						return $.get(currentTransition).transition;
					},

					get params() {
						return $.get(currentTransition).params;
					},
					title: 'Popover title',
					triggeredBy: '#b1',
					children: ($$anchor, $$slotProps) => {
						var p = root();

						$.append($$anchor, p);
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

						var text_2 = $.text('Color');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});

				var node_6 = $.sibling(node_5, 2);

				$.each(node_6, 17, () => colors, $.index, ($$anchor, colorOption) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-24" },
						name: 'alert_reactive',
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

							var text_3 = $.text();

							$.template_effect(() => $.set_text(text_3, $.get(colorOption)));
							$.append($$anchor, text_3);
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

						var text_4 = $.text('Position');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});

				var node_8 = $.sibling(node_7, 2);

				$.each(node_8, 17, () => placements, $.index, ($$anchor, option) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-28" },
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

							var text_5 = $.text();

							$.template_effect(() => $.set_text(text_5, $.get(option)));
							$.append($$anchor, text_5);
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

						var text_6 = $.text('Transition');

						$.append($$anchor, text_6);
					},
					$$slots: { default: true }
				});

				var node_10 = $.sibling(node_9, 2);

				$.each(node_10, 17, () => transitions, $.index, ($$anchor, transition) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-16" },
						name: 'interactive_transition',
						get value() {
							return $.get(transition).name;
						},

						get group() {
							return $.get(selectedTransition);
						},

						set group($$value) {
							$.set(selectedTransition, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text();

							$.template_effect(() => $.set_text(text_7, $.get(transition).name));
							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_3);

				var div_4 = $.sibling(div_3, 2);
				var node_11 = $.child(div_4);

				Button(node_11, {
					class: 'w-36',
					onclick: changeClass,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_8 = $.text();

						$.template_effect(() => $.set_text(text_8, $.get(popoverClass) !== "w-64 text-sm font-light" ? "Remove class" : "Add class"));
						$.append($$anchor, text_8);
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

						var text_9 = $.text();

						$.template_effect(() => $.set_text(text_9, $.get(arrow) ? "Remove arrow" : "Add arrow"));
						$.append($$anchor, text_9);
					},
					$$slots: { default: true }
				});

				var node_13 = $.sibling(node_12, 2);

				Button(node_13, {
					class: 'w-36',
					color: 'rose',
					onclick: changeOffset,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_10 = $.text();

						$.template_effect(() => $.set_text(text_10, $.get(offset) ? "Remove offset" : "Add offset"));
						$.append($$anchor, text_10);
					},
					$$slots: { default: true }
				});

				$.reset(div_4);
				$.append($$anchor, fragment_2);
			},
			$$slots: { codeblock: true, default: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}