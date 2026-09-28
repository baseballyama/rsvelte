import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toast, toast, Button, Label, Radio, uiHelpers } from "$lib";
import { CheckCircleSolid } from "flowbite-svelte-icons";
import { linear } from "svelte/easing";
import { blur, fly, slide, scale, fade } from "svelte/transition";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

var root = $.from_html(`<!> <span class="sr-only">Check icon</span>`, 1);
var root_1 = $.from_html(`<div class="relative h-28 md:h-56"><!></div> <div class="mb-4"><!></div> <div class="mb-4 flex flex-wrap space-x-2"><!> <!></div> <div class="mb-4 flex flex-wrap space-x-4"><!> <!></div> <div class="mb-4 flex flex-wrap space-x-2"><!> <!></div> <div class="flex flex-wrap gap-2"><!></div>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	const binding_group_1 = [];
	const binding_group_2 = [];

	// MetaTag
	let breadcrumb_title = "Toast builder";

	let description = "A quick way to create Toast component";
	let title = "Toast builder";
	let dir = "builder";
	const colors = Object.keys(toast.variants.color);
	let toastColor = $.state("primary");
	let dismissable = $.state(true);

	const changeDismissable = () => {
		$.set(dismissable, !$.get(dismissable));
	};

	const positions = Object.keys(toast.variants.position);
	let toastPosition = $.state("top-left");

	// transition example
	const transitions = [
		{ name: "Default", transition: fly, params: { duration: 400 } },
		{
			name: "Fly",
			transition: fly,
			params: { duration: 300, easing: linear, x: 150 }
		},

		{
			name: "Blur",
			transition: blur,
			params: { duration: 400, easing: linear }
		},

		{
			name: "Slide",
			transition: slide,
			params: { duration: 500, easing: linear, x: -150 }
		},

		{
			name: "Scale",
			transition: scale,
			params: { duration: 400, easing: linear }
		},

		{
			name: "Fade",
			transition: fade,
			params: { duration: 500, easing: linear }
		}
	];

	let selectedTransition = $.state("Default");
	let currentTransition = $.derived(() => transitions.find((t) => t.name === $.get(selectedTransition)) || transitions[0]);
	let toastStatus = $.state(true);

	// code generator
	let generatedCode = $.derived(() => (() => {
		let props = [];

		if ($.get(toastColor) !== "primary") props.push(` color="${$.get(toastColor)}"`);
		if ($.get(dismissable) !== true) props.push(" dismissable={false}");
		if ($.get(toastPosition) !== "top-left") props.push(` position="${$.get(toastPosition)}"`);

		if ($.get(currentTransition) !== transitions[0] && $.get(dismissable)) {
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

		return `<div class="relative h-56">
  <Toast${propsString}>My Toast</Toast>
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

	var fragment = root_2();
	var node = $.first_child(fragment);

	MetaTag(node, { breadcrumb_title, description, title, dir });

	var node_1 = $.sibling(node, 2);

	H1(node_1, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Toast Builder');

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
				var node_3 = $.child(div);

				{
					const icon = ($$anchor) => {
						var fragment_3 = root();
						var node_4 = $.first_child(fragment_3);

						CheckCircleSolid(node_4, { class: 'h-5 w-5' });
						$.next(2);
						$.append($$anchor, fragment_3);
					};

					Toast(node_3, {
						get color() {
							return $.get(toastColor);
						},

						get dismissable() {
							return $.get(dismissable);
						},

						get transition() {
							return $.get(currentTransition).transition;
						},

						get params() {
							return $.get(currentTransition).params;
						},

						get position() {
							return $.get(toastPosition);
						},

						get toastStatus() {
							return $.get(toastStatus);
						},

						set toastStatus($$value) {
							$.set(toastStatus, $$value, true);
						},
						icon,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Toast content');

							$.append($$anchor, text_1);
						},
						$$slots: { icon: true, default: true }
					});
				}

				$.reset(div);

				var div_1 = $.sibling(div, 2);
				var node_5 = $.child(div_1);

				{
					let $0 = $.derived(() => $.get(toastStatus) ? true : false);

					Button(node_5, {
						get disabled() {
							return $.get($0);
						},
						onclick: () => $.set(toastStatus, true),
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Open toast');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				}

				$.reset(div_1);

				var div_2 = $.sibling(div_1, 2);
				var node_6 = $.child(div_2);

				Label(node_6, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('Color');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});

				var node_7 = $.sibling(node_6, 2);

				$.each(node_7, 17, () => colors, $.index, ($$anchor, colorOption) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-24" },
						name: 'interactive_toast_color',
						get color() {
							return $.get(colorOption);
						},

						get value() {
							return $.get(colorOption);
						},

						get group() {
							return $.get(toastColor);
						},

						set group($$value) {
							$.set(toastColor, $$value, true);
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

				$.reset(div_2);

				var div_3 = $.sibling(div_2, 2);
				var node_8 = $.child(div_3);

				Label(node_8, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text('Transition');

						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});

				var node_9 = $.sibling(node_8, 2);

				$.each(node_9, 17, () => transitions, $.index, ($$anchor, transition) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-16" },
						name: 'interactive_toast_transition',
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

							var text_6 = $.text();

							$.template_effect(() => $.set_text(text_6, $.get(transition).name));
							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_3);

				var div_4 = $.sibling(div_3, 2);
				var node_10 = $.child(div_4);

				Label(node_10, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_7 = $.text('Position');

						$.append($$anchor, text_7);
					},
					$$slots: { default: true }
				});

				var node_11 = $.sibling(node_10, 2);

				$.each(node_11, 17, () => positions, $.index, ($$anchor, option) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-32" },
						name: 'interactive_toast_position',
						get value() {
							return $.get(option);
						},

						get group() {
							return $.get(toastPosition);
						},

						set group($$value) {
							$.set(toastPosition, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text();

							$.template_effect(() => $.set_text(text_8, $.get(option)));
							$.append($$anchor, text_8);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_4);

				var div_5 = $.sibling(div_4, 2);
				var node_12 = $.child(div_5);

				Button(node_12, {
					onclick: changeDismissable,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_9 = $.text();

						$.template_effect(() => $.set_text(text_9, `${$.get(dismissable) ? "Disable" : "Enable"} dismissable`));
						$.append($$anchor, text_9);
					},
					$$slots: { default: true }
				});

				$.reset(div_5);
				$.append($$anchor, fragment_2);
			},
			$$slots: { codeblock: true, default: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}