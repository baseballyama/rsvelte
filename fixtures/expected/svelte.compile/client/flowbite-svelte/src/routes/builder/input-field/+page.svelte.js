import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Input,
	input,
	Radio,
	Label,
	Helper,
	Button,
	CloseButton,
	uiHelpers
} from "$lib";

import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

var root = $.from_html(`<span class="font-medium">Well done!</span> Some helper message.`, 1);
var root_1 = $.from_html(`<div class="mb-4 md:h-24"><!> <!> <!></div> <div class="mb-4 flex flex-wrap space-x-2"><!> <!></div> <div class="mb-4 flex flex-wrap space-x-2"><!> <!></div> <div class="mb-4 flex flex-wrap space-x-2"><!> <!> <!></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start"><!> <!></div>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	const binding_group_1 = [];
	const binding_group_2 = [];

	// MetaTag
	let breadcrumb_title = "Input field builder";

	let description = "A quick way to create Input field component";
	let title = "Input field builder";
	let dir = "builder";
	let text = $.prop($$props, 'text', 15, "");
	const sizes = ["sm", "md", "lg"];
	let inputSize = $.state("md");
	const colors = Object.keys(input.variants.color);
	let inputColor = $.state("default");
	let disabled = $.state(false);

	const changeDisabled = () => {
		$.set(disabled, !$.get(disabled));
	};

	let helperColor = $.state("default");
	let helperSlot = $.state(false);

	const changeHelperSlot = () => {
		$.set(helperSlot, !$.get(helperSlot));
		$.set(helperColor, "default");
	};

	let closeBtnStatus = $.state(false);

	const changeCloseBtnStatus = () => {
		$.set(closeBtnStatus, !$.get(closeBtnStatus));
	};

	// code generator
	let generatedCode = $.derived(() => (() => {
		let props = [];

		if ($.get(inputColor) !== "default") props.push(` color="${$.get(inputColor)}"`);
		if ($.get(disabled)) props.push(" disabled");
		if ($.get(inputSize) !== "md") props.push(` size="${$.get(inputSize)}"`);

		const propsString = props.length > 0
			? props.map((prop) => `\n  ${prop}`).join("") + "\n"
			: "";

		return `<Input${propsString}${$.get(closeBtnStatus)
			? `>\n{#snippet right()}
  <CloseButton onclick={() => (text = '')} />
{/snippet}`
			: "/>"}
${$.get(closeBtnStatus) ? `</Input>` : ""}${$.get(helperSlot)
			? `<Helper class="ps-6" color="${$.get(helperColor)}">Helper text</Helper>`
			: ""}`;
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

			var text_1 = $.text('Input Builder');

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
				var fragment_2 = root_1();
				var div = $.first_child(fragment_2);
				var node_3 = $.child(div);

				Label(node_3, {
					for: 'color-example',
					get color() {
						return $.get(inputColor);
					},
					class: 'mb-2 block',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('Your name');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});

				var node_4 = $.sibling(node_3, 2);

				{
					const right = ($$anchor) => {
						var fragment_3 = $.comment();
						var node_5 = $.first_child(fragment_3);

						{
							var consequent = ($$anchor) => {
								CloseButton($$anchor, { onclick: () => text("") });
							};

							$.if(node_5, ($$render) => {
								if ($.get(closeBtnStatus)) $$render(consequent);
							});
						}

						$.append($$anchor, fragment_3);
					};

					let $0 = $.derived(() => $.get(disabled) ? "Disabled " : "Placeholder");

					Input(node_4, {
						id: 'color-example',
						get disabled() {
							return $.get(disabled);
						},

						get color() {
							return $.get(inputColor);
						},

						get size() {
							return $.get(inputSize);
						},

						get placeholder() {
							return $.get($0);
						},

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

				var node_6 = $.sibling(node_4, 2);

				{
					var consequent_1 = ($$anchor) => {
						Helper($$anchor, {
							class: 'mt-2',
							get color() {
								return $.get(helperColor);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_6 = root();

								$.next();
								$.append($$anchor, fragment_6);
							},
							$$slots: { default: true }
						});
					};

					$.if(node_6, ($$render) => {
						if ($.get(helperSlot)) $$render(consequent_1);
					});
				}

				$.reset(div);

				var div_1 = $.sibling(div, 2);
				var node_7 = $.child(div_1);

				Label(node_7, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('Color');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});

				var node_8 = $.sibling(node_7, 2);

				$.each(node_8, 17, () => colors, $.index, ($$anchor, colorOption) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-20" },
						name: 'input_color',
						get color() {
							return $.get(colorOption);
						},

						get value() {
							return $.get(colorOption);
						},

						get group() {
							return $.get(inputColor);
						},

						set group($$value) {
							$.set(inputColor, $$value, true);
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
				var node_9 = $.child(div_2);

				Label(node_9, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text('Size');

						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});

				var node_10 = $.sibling(node_9, 2);

				$.each(node_10, 17, () => sizes, $.index, ($$anchor, option) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-20" },
						name: 'input_size',
						get value() {
							return $.get(option);
						},

						get group() {
							return $.get(inputSize);
						},

						set group($$value) {
							$.set(inputSize, $$value, true);
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
				var node_11 = $.child(div_3);

				Button(node_11, {
					class: 'mb-4 w-40',
					color: 'secondary',
					onclick: changeHelperSlot,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_7 = $.text();

						$.template_effect(() => $.set_text(text_7, $.get(helperSlot) ? "Remove helper" : "Add helper"));
						$.append($$anchor, text_7);
					},
					$$slots: { default: true }
				});

				var node_12 = $.sibling(node_11, 2);

				Label(node_12, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_8 = $.text('Helper Color');

						$.append($$anchor, text_8);
					},
					$$slots: { default: true }
				});

				var node_13 = $.sibling(node_12, 2);

				$.each(node_13, 17, () => colors, $.index, ($$anchor, colorOption) => {
					{
						let $0 = $.derived(() => $.get(helperSlot) ? '' : 'cursor-not-allowed opacity-30');
						let $1 = $.derived(() => $.get(helperSlot) ? false : true);

						Radio($$anchor, {
							get class() {
								return `my-1 ${$.get($0) ?? ''}`;
							},
							classes: { label: "w-20" },
							get disabled() {
								return $.get($1);
							},
							name: 'helper_color',
							get color() {
								return $.get(colorOption);
							},

							get value() {
								return $.get(colorOption);
							},

							get group() {
								return $.get(helperColor);
							},

							set group($$value) {
								$.set(helperColor, $$value, true);
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_9 = $.text();

								$.template_effect(() => $.set_text(text_9, $.get(colorOption)));
								$.append($$anchor, text_9);
							},
							$$slots: { default: true }
						});
					}
				});

				$.reset(div_3);

				var div_4 = $.sibling(div_3, 2);
				var node_14 = $.child(div_4);

				Button(node_14, {
					class: 'w-44',
					onclick: changeDisabled,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_10 = $.text();

						$.template_effect(() => $.set_text(text_10, $.get(disabled) ? "Remove disabled" : "Add disabled"));
						$.append($$anchor, text_10);
					},
					$$slots: { default: true }
				});

				var node_15 = $.sibling(node_14, 2);

				Button(node_15, {
					class: 'w-44',
					color: 'secondary',
					onclick: changeCloseBtnStatus,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_11 = $.text();

						$.template_effect(() => $.set_text(text_11, $.get(closeBtnStatus) ? "Remove close button" : "Add close button"));
						$.append($$anchor, text_11);
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