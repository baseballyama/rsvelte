import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Radio, radio, Helper, Label, Button, uiHelpers } from "$lib";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

var root = $.from_html(`<div class="mb-4"><!> <!></div> <div class="mb-4 flex flex-wrap space-x-2"><!> <!></div> <div class="mb-4 flex flex-wrap space-x-2"><!> <!> <!></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start"><!> <!> <!></div>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	const binding_group_1 = [];

	// MetaTag
	let breadcrumb_title = "Radio builder";

	let description = "A quick way to create Radio component";
	let title = "Radio builder";
	let dir = "builder";

	// end of dynamic svelte component
	const colors = Object.keys(radio.variants.color);

	let radioColor = $.state("primary");

	// hack for demo purposes
	let demoRadioColor = $.state("primary");

	let isChecked = $.state(true);

	const handleOnchange = (colorOption) => {
		$.set(demoRadioColor, colorOption, true);
		$.set(isChecked, false);
		$.set(isChecked, true);
	};

	// end of hack
	const inputClasses = ["", "w-6 h-6"];

	let inputClass = $.state($.proxy(inputClasses[0]));

	const changeInputClass = () => {
		$.set(inputClass, $.get(inputClass) === inputClasses[0] ? inputClasses[1] : inputClasses[0], true);
	};

	const labelClasses = ["w-24 m-2", ""];
	let labelClass = $.state($.proxy(labelClasses[0]));

	const changeLabelClass = () => {
		$.set(labelClass, $.get(labelClass) === labelClasses[0] ? labelClasses[1] : labelClasses[0], true);
	};

	let disabled = $.state(false);

	const changeDisabled = () => {
		$.set(disabled, !$.get(disabled));
	};

	let helperColor = $.state("primary");
	let helperSlot = $.state(false);

	const changeHelperSlot = () => {
		$.set(helperSlot, !$.get(helperSlot));

		// helperColor = 'gray';
	};

	// code generator
	let generatedCode = $.derived(() => (() => {
		let props = [];

		if ($.get(radioColor) !== "primary") props.push(`color="${$.get(radioColor)}"`);
		if ($.get(labelClass) !== "") props.push(`classes={{label:"${$.get(labelClass)}"}}`);
		if ($.get(inputClass) !== "") props.push(`class="${$.get(inputClass)}"`);
		if ($.get(disabled)) props.push("disabled");

		// if (indeterminateState) props.push(' indeterminate');
		// if (disabledState) props.push(' disabled');
		const propsString = props.length > 0
			? props.map((prop) => `\n  ${prop}`).join("") + "\n"
			: "";

		return `<Radio
  name="my_radio"${propsString}>Item 1</Radio>
${$.get(helperSlot)
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

	var fragment = root_1();
	var node = $.first_child(fragment);

	MetaTag(node, { breadcrumb_title, description, title, dir });

	var node_1 = $.sibling(node, 2);

	H1(node_1, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Radio Builder');

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

				{
					let $0 = $.derived(() => ({ label: $.get(labelClass) }));

					Radio(node_3, {
						get class() {
							return $.get(inputClass);
						},

						get classes() {
							return $.get($0);
						},
						name: 'radio_interactive',
						get disabled() {
							return $.get(disabled);
						},

						get color() {
							return $.get(demoRadioColor);
						},

						get checked() {
							return $.get(isChecked);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Radio');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				}

				var node_4 = $.sibling(node_3, 2);

				{
					var consequent = ($$anchor) => {
						Helper($$anchor, {
							id: 'helper-radio-text',
							get color() {
								return $.get(helperColor);
							},
							class: 'ps-6',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text('For orders shipped from $25 in books or $29 in other categories');

								$.append($$anchor, text_2);
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
						name: 'radio_color',
						onchange: () => handleOnchange($.get(colorOption)),
						get color() {
							return $.get(colorOption);
						},

						get value() {
							return $.get(colorOption);
						},

						get group() {
							return $.get(radioColor);
						},

						set group($$value) {
							$.set(radioColor, $$value, true);
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

				Button(node_7, {
					class: 'mb-4 w-40',
					color: 'secondary',
					onclick: changeHelperSlot,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text();

						$.template_effect(() => $.set_text(text_5, $.get(helperSlot) ? "Remove helper" : "Add helper"));
						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});

				var node_8 = $.sibling(node_7, 2);

				Label(node_8, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_6 = $.text('Helper Color');

						$.append($$anchor, text_6);
					},
					$$slots: { default: true }
				});

				var node_9 = $.sibling(node_8, 2);

				$.each(node_9, 17, () => colors, $.index, ($$anchor, colorOption) => {
					{
						let $0 = $.derived(() => $.get(helperSlot) ? '' : 'cursor-not-allowed opacity-30');
						let $1 = $.derived(() => $.get(helperSlot) ? false : true);

						Radio($$anchor, {
							get class() {
								return `my-1${$.get($0) ?? ''}`;
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

								var text_7 = $.text();

								$.template_effect(() => $.set_text(text_7, $.get(colorOption)));
								$.append($$anchor, text_7);
							},
							$$slots: { default: true }
						});
					}
				});

				$.reset(div_2);

				var div_3 = $.sibling(div_2, 2);
				var node_10 = $.child(div_3);

				Button(node_10, {
					class: 'w-32',
					color: 'primary',
					onclick: changeInputClass,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_8 = $.text();

						$.template_effect(() => $.set_text(text_8, $.get(inputClass) === inputClasses[0] ? "class=w-6 h-6" : "Default size"));
						$.append($$anchor, text_8);
					},
					$$slots: { default: true }
				});

				var node_11 = $.sibling(node_10, 2);

				Button(node_11, {
					class: 'w-32',
					color: 'secondary',
					onclick: changeLabelClass,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_9 = $.text();

						$.template_effect(() => $.set_text(text_9, $.get(labelClass) === labelClasses[0] ? "Default label" : "label:w-24 m-2"));
						$.append($$anchor, text_9);
					},
					$$slots: { default: true }
				});

				var node_12 = $.sibling(node_11, 2);

				Button(node_12, {
					class: 'w-32',
					color: 'lime',
					onclick: changeDisabled,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_10 = $.text();

						$.template_effect(() => $.set_text(text_10, $.get(disabled) ? "Enabled" : "Disabled"));
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