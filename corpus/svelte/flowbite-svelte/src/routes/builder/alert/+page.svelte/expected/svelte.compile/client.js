import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Alert,
	alert as fsalert,
	Button,
	Label,
	Radio,
	uiHelpers,
	Input
} from "$lib";

import { InfoCircleSolid } from "flowbite-svelte-icons";
import { blur, fly, slide, scale } from "svelte/transition";
import { linear } from "svelte/easing";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

var root = $.from_html(`<span class="font-medium"> </span>`);
var root_1 = $.from_html(`<div class="mb-4 h-20"><!></div> <div class="mb-4 h-12"><!></div> <div class="mb-4 flex flex-wrap space-x-4"><!> <!></div> <div class="mb-4 flex flex-wrap space-x-4"><!> <!></div> <div class="mb-4 flex flex-wrap space-x-4"><!> <!></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start"><!> <!> <!> <!> <!> <!></div>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	const binding_group_1 = [];

	// MetaTag
	let breadcrumb_title = "Alert builder";

	let description = "A quick way to create Alert component";
	let title = "Alert builder";
	let dir = "builder";

	// for interactive code builder
	let alertMessage = $.state("My Alert!");

	const colors = Object.keys(fsalert.variants.color);
	let color = $.state("primary");
	let iconSlot = $.state(false);

	const changeIconSlot = () => {
		$.set(iconSlot, !$.get(iconSlot));
	};

	let rounded = $.state(false);

	const changeRounded = () => {
		$.set(rounded, !$.get(rounded));
	};

	let border = $.state(false);

	const changeBorder = () => {
		$.set(border, !$.get(border));
	};

	let dismissable = $.state(true);

	const changeDismissable = () => {
		$.set(dismissable, !$.get(dismissable));
	};

	let alertStatusInteractive = $.state(true);

	const changeStatusInteractive = () => {
		$.set(alertStatusInteractive, true);
	};

	let alertClass = $.state("");

	const changeClass = () => {
		$.set(alertClass, $.get(alertClass) === "" ? "pl-10" : "", true);
	};

	let borderAccent = $.state(false);

	const changeBorderAccent = () => {
		$.set(borderAccent, !$.get(borderAccent));
		$.set(alertClass, $.get(borderAccent) ? "border-t-4" : "", true);
		$.set(rounded, false);
	};

	// end of interactive code builder
	// transition
	const transitions = [
		{
			name: "Fly",
			transition: fly,
			params: { duration: 500, easing: linear, x: 150 }
		},

		{
			name: "Blur",
			transition: blur,
			params: { duration: 500, easing: linear }
		},

		{
			name: "Slide",
			transition: slide,
			params: { duration: 500, easing: linear, x: -150 }
		},

		{
			name: "Scale",
			transition: scale,
			params: { duration: 500, easing: linear }
		}
	];

	let selectedTransition = $.state("Fly");
	let currentTransition = $.derived(() => transitions.find((t) => t.name === $.get(selectedTransition)) || transitions[0]);

	// code generator
	let generatedCode = $.derived(() => (() => {
		// Generate import script using string literals
		// const importScript = `  // script tag \n  import { Alert } from "flowbite-svelte";\n  // script tag \n`;
		let props = [];

		if ($.get(color) !== "primary") props.push(` color="${$.get(color)}"`);
		if ($.get(rounded)) props.push(" rounded");
		if ($.get(border)) props.push(" border");
		if ($.get(dismissable)) props.push(" dismissable");
		if ($.get(alertClass)) props.push(` class="${$.get(alertClass)}"`);
		if (!$.get(alertStatusInteractive)) props.push(" alertStatus={false}");

		if ($.get(currentTransition) !== transitions[0] && $.get(dismissable)) {
			props.push(` transition={${$.get(currentTransition).name.toLowerCase()}}`);

			// Generate params string without quotes and handle functions
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
			? props.map((prop) => `\n  ${prop}`).join("") + "\n  "
			: "";

		let iconCode = "";

		if ($.get(iconSlot)) {
			iconCode = `
    {#snippet icon()}
      <InfoCircleSolid class="h-5 w-5" />
    {/snippet}`;
		}

		// Add import script at the beginning
		return `  <Alert${propsString}>${iconCode}
    ${$.get(alertMessage)}
  </Alert>`;
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

			var text = $.text('Alert Builder');

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
						var fragment_3 = $.comment();
						var node_4 = $.first_child(fragment_3);

						{
							var consequent = ($$anchor) => {
								InfoCircleSolid($$anchor, { class: 'h-5 w-5' });
							};

							$.if(node_4, ($$render) => {
								if ($.get(iconSlot)) $$render(consequent);
							});
						}

						$.append($$anchor, fragment_3);
					};

					Alert(node_3, {
						get color() {
							return $.get(color);
						},

						get rounded() {
							return $.get(rounded);
						},

						get border() {
							return $.get(border);
						},

						get dismissable() {
							return $.get(dismissable);
						},

						get class() {
							return $.get(alertClass);
						},

						get transition() {
							return $.get(currentTransition).transition;
						},

						get params() {
							return $.get(currentTransition).params;
						},

						get alertStatus() {
							return $.get(alertStatusInteractive);
						},

						set alertStatus($$value) {
							$.set(alertStatusInteractive, $$value, true);
						},
						icon,
						children: ($$anchor, $$slotProps) => {
							var span = root();
							var text_1 = $.only_child(span, true);

							$.template_effect(() => $.set_text(text_1, $.get(alertMessage)));
							$.append($$anchor, span);
						},
						$$slots: { icon: true, default: true }
					});
				}

				$.reset(div);

				var div_1 = $.sibling(div, 2);
				var node_5 = $.child(div_1);

				{
					let $0 = $.derived(() => $.get(alertStatusInteractive) ? true : false);

					Button(node_5, {
						get disabled() {
							return $.get($0);
						},
						onclick: changeStatusInteractive,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Open alert');

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

						var text_3 = $.text('Alert message');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});

				var node_7 = $.sibling(node_6, 2);

				Input(node_7, {
					get value() {
						return $.get(alertMessage);
					},

					set value($$value) {
						$.set(alertMessage, $$value, true);
					}
				});

				$.reset(div_2);

				var div_3 = $.sibling(div_2, 2);
				var node_8 = $.child(div_3);

				Label(node_8, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text('Color');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});

				var node_9 = $.sibling(node_8, 2);

				$.each(node_9, 17, () => colors, $.index, ($$anchor, colorOption) => {
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

							var text_5 = $.text();

							$.template_effect(() => $.set_text(text_5, $.get(colorOption)));
							$.append($$anchor, text_5);
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

						var text_6 = $.text('Transition');

						$.append($$anchor, text_6);
					},
					$$slots: { default: true }
				});

				var node_11 = $.sibling(node_10, 2);

				$.each(node_11, 17, () => transitions, $.index, ($$anchor, transition) => {
					{
						let $0 = $.derived(() => $.get(dismissable) ? false : true);

						Radio($$anchor, {
							get disabled() {
								return $.get($0);
							},

							classes: {
								label: "w-16 my-1 {dismissable ? '' : 'opacity-30 cursor-not-allowed'}"
							},
							name: 'transition_interactive',
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
					}
				});

				$.reset(div_4);

				var div_5 = $.sibling(div_4, 2);
				var node_12 = $.child(div_5);

				Button(node_12, {
					class: 'w-48',
					color: 'blue',
					onclick: changeRounded,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_8 = $.text();

						$.template_effect(() => $.set_text(text_8, $.get(rounded) ? "Remove rounded" : "Add rounded"));
						$.append($$anchor, text_8);
					},
					$$slots: { default: true }
				});

				var node_13 = $.sibling(node_12, 2);

				Button(node_13, {
					class: 'w-48',
					color: 'red',
					onclick: changeBorder,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_9 = $.text();

						$.template_effect(() => $.set_text(text_9, $.get(border) ? "Remove border" : "Add border"));
						$.append($$anchor, text_9);
					},
					$$slots: { default: true }
				});

				var node_14 = $.sibling(node_13, 2);

				Button(node_14, {
					class: 'w-48',
					color: 'yellow',
					onclick: changeDismissable,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_10 = $.text();

						$.template_effect(() => $.set_text(text_10, $.get(dismissable) ? "Remove dismissable" : "Add dismissable"));
						$.append($$anchor, text_10);
					},
					$$slots: { default: true }
				});

				var node_15 = $.sibling(node_14, 2);

				Button(node_15, {
					class: 'w-48',
					color: 'green',
					onclick: changeClass,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_11 = $.text();

						$.template_effect(() => $.set_text(text_11, $.get(alertClass) ? "Remove class" : "Add class"));
						$.append($$anchor, text_11);
					},
					$$slots: { default: true }
				});

				var node_16 = $.sibling(node_15, 2);

				Button(node_16, {
					class: 'w-48',
					color: 'sky',
					onclick: changeIconSlot,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_12 = $.text();

						$.template_effect(() => $.set_text(text_12, $.get(iconSlot) ? "Remove icon" : "Add icon"));
						$.append($$anchor, text_12);
					},
					$$slots: { default: true }
				});

				var node_17 = $.sibling(node_16, 2);

				Button(node_17, {
					class: 'w-48',
					color: 'rose',
					onclick: changeBorderAccent,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_13 = $.text();

						$.template_effect(() => $.set_text(text_13, $.get(borderAccent) ? "Remove accent" : "Add accent"));
						$.append($$anchor, text_13);
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