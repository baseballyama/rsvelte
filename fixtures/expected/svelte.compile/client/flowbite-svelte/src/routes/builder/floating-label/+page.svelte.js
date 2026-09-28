import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	FloatingLabelInput,
	Helper,
	Label,
	Radio,
	Toggle,
	floatingLabelInput,
	Button
} from "$lib";

import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

var root = $.from_html(`Remember, contributions to this topic should follow our <a href="/">Community Guidelines</a> .`, 1);
var root_1 = $.from_html(`<span class="me-4">Default</span>`);
var root_2 = $.from_html(`<div class="mb-4 md:h-20"><!> <!></div> <div class="mb-4 flex flex-wrap space-x-2"><!> <!></div> <div class="mb-4 flex flex-wrap space-x-2"><!> <!></div> <div class="mb-4 flex flex-wrap space-x-2"><!> <!> <!></div> <div class="mb-4 flex flex-wrap space-x-4"><!> <!></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start"><!></div>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	const binding_group_1 = [];
	const binding_group_2 = [];

	// MetaTag
	let breadcrumb_title = "Floating label builder";

	let description = "A quick way to create Floating label component";
	let title = "Floating label builder";
	let dir = "builder";
	const inputStyles = ["standard", "filled", "outlined"];
	let inputStyle = $.state("standard");
	let floatingSize = $.state("default");
	const colors = Object.keys(floatingLabelInput.variants.color);
	let floatingColor = $.state("default");
	let helperColor = $.state("default");
	let disabled = $.state(false);

	const changeDisabled = () => {
		$.set(disabled, !$.get(disabled));
	};

	let helperSlot = $.state(false);

	const changeHelperSlot = () => {
		$.set(helperSlot, !$.get(helperSlot));
		$.set(helperColor, "default");
	};

	// code generator
	let generatedCode = $.derived(() => (() => {
		let props = [];

		if ($.get(floatingColor) !== "default") props.push(` color="${$.get(floatingColor)}"`);
		if ($.get(disabled)) props.push(" disabled");
		if ($.get(inputStyle) !== "standard") props.push(` inputStyle="${$.get(inputStyle)}"`);
		if ($.get(floatingSize) !== "default") props.push(` size="${$.get(floatingSize)}"`);

		const propsString = props.length > 0
			? props.map((prop) => `\n  ${prop}`).join("") + "\n"
			: "";

		let helperCode = "";

		if ($.get(helperSlot)) {
			helperCode = `
<Helper class="pt-2" color="${$.get(helperColor)}">
  Helper text
</Helper>`;
		}

		return `<FloatingLabelInput ${propsString}>
  Floating label
</FloatingLabelInput>${helperCode}`;
	})());

	// for interactive builder
	let builderExpand = $.state(false);

	let showBuilderExpandButton = $.derived(() => isGeneratedCodeOverflow($.get(generatedCode)));

	const handleBuilderExpandClick = () => {
		$.set(builderExpand, !$.get(builderExpand));
	};

	var fragment = root_3();
	var node = $.first_child(fragment);

	MetaTag(node, { breadcrumb_title, description, title, dir });

	var node_1 = $.sibling(node, 2);

	H1(node_1, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Floating-label Builder');

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

				FloatingLabelInput(node_3, {
					get variant() {
						return $.get(inputStyle);
					},

					get disabled() {
						return $.get(disabled);
					},

					get size() {
						return $.get(floatingSize);
					},

					get color() {
						return $.get(floatingColor);
					},
					id: 'floating_filled',
					type: 'text',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text();

						$.template_effect(() => $.set_text(text_1, `Floating ${$.get(inputStyle) ?? ''}`));
						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				var node_4 = $.sibling(node_3, 2);

				{
					var consequent = ($$anchor) => {
						Helper($$anchor, {
							class: 'pt-2',
							get color() {
								return $.get(helperColor);
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var fragment_5 = root();

								$.next(2);
								$.append($$anchor, fragment_5);
							},
							$$slots: { default: true }
						});
					};

					$.if(node_4, ($$render) => {
						if ($.get(helperSlot)) $$render(consequent);
					});
				}

				$.reset(div);

				var div_1 = $.sibling(div, 2);
				var node_5 = $.child(div_1);

				Label(node_5, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('Style');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});

				var node_6 = $.sibling(node_5, 2);

				$.each(node_6, 17, () => inputStyles, $.index, ($$anchor, option) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-24" },
						name: 'style1',
						get value() {
							return $.get(option);
						},

						get group() {
							return $.get(inputStyle);
						},

						set group($$value) {
							$.set(inputStyle, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text();

							$.template_effect(() => $.set_text(text_3, $.get(option)));
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

						var text_4 = $.text('Color');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});

				var node_8 = $.sibling(node_7, 2);

				$.each(node_8, 17, () => colors, $.index, ($$anchor, colorOption) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-24" },
						name: 'floating_color',
						get color() {
							return $.get(colorOption);
						},

						get value() {
							return $.get(colorOption);
						},

						get group() {
							return $.get(floatingColor);
						},

						set group($$value) {
							$.set(floatingColor, $$value, true);
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

				$.reset(div_2);

				var div_3 = $.sibling(div_2, 2);
				var node_9 = $.child(div_3);

				Button(node_9, {
					class: 'mb-4 w-48',
					color: 'secondary',
					onclick: changeHelperSlot,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_6 = $.text();

						$.template_effect(() => $.set_text(text_6, $.get(helperSlot) ? "Remove helper slot" : "Add helper slot"));
						$.append($$anchor, text_6);
					},
					$$slots: { default: true }
				});

				var node_10 = $.sibling(node_9, 2);

				Label(node_10, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_7 = $.text('Helper Color');

						$.append($$anchor, text_7);
					},
					$$slots: { default: true }
				});

				var node_11 = $.sibling(node_10, 2);

				$.each(node_11, 17, () => colors, $.index, ($$anchor, colorOption) => {
					{
						let $0 = $.derived(() => $.get(helperSlot) ? '' : 'cursor-not-allowed opacity-30');
						let $1 = $.derived(() => $.get(helperSlot) ? false : true);

						Radio($$anchor, {
							get class() {
								return `my-1 ${$.get($0) ?? ''}`;
							},
							classes: { label: "w-24" },
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

								var text_8 = $.text();

								$.template_effect(() => $.set_text(text_8, $.get(colorOption)));
								$.append($$anchor, text_8);
							},
							$$slots: { default: true }
						});
					}
				});

				$.reset(div_3);

				var div_4 = $.sibling(div_3, 2);
				var node_12 = $.child(div_4);

				Label(node_12, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_9 = $.text('Size');

						$.append($$anchor, text_9);
					},
					$$slots: { default: true }
				});

				var node_13 = $.sibling(node_12, 2);

				{
					const offLabel = ($$anchor) => {
						var span = root_1();

						$.append($$anchor, span);
					};

					Toggle(node_13, {
						onclick: () => {
							$.set(floatingSize, $.get(floatingSize) === "default" ? "small" : "default", true);
						},
						offLabel,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_10 = $.text('Small');

							$.append($$anchor, text_10);
						},
						$$slots: { offLabel: true, default: true }
					});
				}

				$.reset(div_4);

				var div_5 = $.sibling(div_4, 2);
				var node_14 = $.child(div_5);

				Button(node_14, {
					class: 'w-48',
					onclick: changeDisabled,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_11 = $.text();

						$.template_effect(() => $.set_text(text_11, $.get(disabled) ? "Remove disabled" : "Add disabled"));
						$.append($$anchor, text_11);
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