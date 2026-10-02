import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Range, range, Label, Button, Radio, uiHelpers } from "$lib";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<span class="absolute start-0 -bottom-6 text-sm text-gray-500 dark:text-gray-400"> </span> <span class="absolute start-1/2 -bottom-6 -translate-x-1/2 text-sm text-gray-500 rtl:translate-x-1/2 dark:text-gray-400"> </span> <span class="absolute end-0 -bottom-6 text-sm text-gray-500 dark:text-gray-400"> </span>`, 1);
var root_2 = $.from_html(`<div class="relative"> <!> <!> <!></div> <div class="mt-12 mb-4 flex flex-wrap space-x-2"><!> <!></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start"><!> <!> <!> <!></div>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];

	// MetaTag
	let breadcrumb_title = "Range builder";

	let description = "A quick way to create Range component";
	let title = "Range builder";
	let dir = "builder";
	let interactiveValue = $.state(5);
	let stepValue = $.state(1);

	const changeStepValue = () => {
		$.set(stepValue, $.get(stepValue) === 0.5 ? 1 : 0.5, true);
	};

	const colors = Object.keys(range.variants.color);
	let rangeColor = $.state("blue");
	let disabled = $.state(false);

	const changeDisabled = () => {
		$.set(disabled, !$.get(disabled));
	};

	let minmax = $.proxy({ min: 0, max: 10 });

	const changeMinMax = () => {
		if (minmax.max === 10) {
			minmax.min = 0;
			minmax.max = 20;
			$.set(interactiveValue, 10);
		} else {
			minmax.min = 0;
			minmax.max = 10;
			$.set(interactiveValue, 5);
		}
	};

	let labelStatus = $.state(false);

	const changeLabelStatus = () => {
		$.set(labelStatus, !$.get(labelStatus));
	};

	// code generator
	let generatedCode = $.derived(() => (() => {
		let props = [];

		if ($.get(rangeColor)) props.push(`color="${$.get(rangeColor)}"`);
		if (minmax.max !== 10) props.push(`min="${minmax.min}" max="${minmax.max}"`);
		if ($.get(stepValue) !== 1) props.push(`step="${$.get(stepValue)}"`);
		if ($.get(disabled)) props.push("disabled");

		const propsString = props.length > 0
			? props.map((prop) => `\n  ${prop}`).join("") + "\n"
			: "";

		return `${$.get(labelStatus) ? `<div class="relative">\n  ` : ""}<Range${propsString}/>
${$.get(labelStatus)
			? `<span class="text-sm text-gray-500 dark:text-gray-400 absolute start-0 -bottom-6">Min: ${minmax.min}</span>
<span class="text-sm text-gray-500 dark:text-gray-400 absolute start-1/2 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">${minmax.max / 2}</span>
<span class="text-sm text-gray-500 dark:text-gray-400 absolute end-0 -bottom-6">Max: ${minmax.max}</span></div>`
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

	var fragment = root_3();
	var node = $.first_child(fragment);

	MetaTag(node, { breadcrumb_title, description, title, dir });

	var node_1 = $.sibling(node, 2);

	H1(node_1, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Range Builder');

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
				var text_1 = $.child(div);
				var node_3 = $.sibling(text_1);

				{
					var consequent = ($$anchor) => {
						var p = root();
						var text_2 = $.only_child(p);

						$.template_effect(() => $.set_text(text_2, `Value: ${$.get(interactiveValue) ?? ''}`));
						$.append($$anchor, p);
					};

					$.if(node_3, ($$render) => {
						if (minmax.max !== 10) $$render(consequent);
					});
				}

				var node_4 = $.sibling(node_3, 2);

				Range(node_4, {
					get color() {
						return $.get(rangeColor);
					},

					get disabled() {
						return $.get(disabled);
					},

					get min() {
						return minmax.min;
					},

					get max() {
						return minmax.max;
					},

					get step() {
						return $.get(stepValue);
					},
					appearance: 'auto',
					get value() {
						return $.get(interactiveValue);
					},

					set value($$value) {
						$.set(interactiveValue, $$value, true);
					}
				});

				var node_5 = $.sibling(node_4, 2);

				{
					var consequent_1 = ($$anchor) => {
						var fragment_3 = root_1();
						var span = $.first_child(fragment_3);
						var text_3 = $.only_child(span);
						var span_1 = $.sibling(span, 2);
						var text_4 = $.only_child(span_1, true);
						var span_2 = $.sibling(span_1, 2);
						var text_5 = $.only_child(span_2);

						$.template_effect(() => {
							$.set_text(text_3, `Min: ${minmax.min ?? ''}`);
							$.set_text(text_4, minmax.max / 2);
							$.set_text(text_5, `Max: ${minmax.max ?? ''}`);
						});

						$.append($$anchor, fragment_3);
					};

					$.if(node_5, ($$render) => {
						if ($.get(labelStatus)) $$render(consequent_1);
					});
				}

				$.reset(div);

				var div_1 = $.sibling(div, 2);
				var node_6 = $.child(div_1);

				Label(node_6, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_6 = $.text('Color');

						$.append($$anchor, text_6);
					},
					$$slots: { default: true }
				});

				var node_7 = $.sibling(node_6, 2);

				$.each(node_7, 17, () => colors, $.index, ($$anchor, colorOption) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-24" },
						name: 'default_alert_color',
						get color() {
							return $.get(colorOption);
						},

						get value() {
							return $.get(colorOption);
						},

						get group() {
							return $.get(rangeColor);
						},

						set group($$value) {
							$.set(rangeColor, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text();

							$.template_effect(() => $.set_text(text_7, $.get(colorOption)));
							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_1);

				var div_2 = $.sibling(div_1, 2);
				var node_8 = $.child(div_2);

				Button(node_8, {
					class: 'w-40',
					onclick: changeDisabled,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_8 = $.text();

						$.template_effect(() => $.set_text(text_8, $.get(disabled) ? "Enabled" : "Disabled"));
						$.append($$anchor, text_8);
					},
					$$slots: { default: true }
				});

				var node_9 = $.sibling(node_8, 2);

				Button(node_9, {
					class: 'w-40',
					color: 'secondary',
					onclick: changeMinMax,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_9 = $.text();

						$.template_effect(() => $.set_text(text_9, minmax.max === 10 ? "Add max min" : "Remove max min"));
						$.append($$anchor, text_9);
					},
					$$slots: { default: true }
				});

				var node_10 = $.sibling(node_9, 2);

				Button(node_10, {
					class: 'w-40',
					color: 'rose',
					onclick: changeLabelStatus,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_10 = $.text();

						$.template_effect(() => $.set_text(text_10, $.get(labelStatus) ? "Remove label" : "Add label"));
						$.append($$anchor, text_10);
					},
					$$slots: { default: true }
				});

				var node_11 = $.sibling(node_10, 2);

				Button(node_11, {
					class: 'w-40',
					color: 'indigo',
					onclick: changeStepValue,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_11 = $.text();

						$.template_effect(() => $.set_text(text_11, $.get(stepValue) !== 0.5 ? "Add step" : "Remove step"));
						$.append($$anchor, text_11);
					},
					$$slots: { default: true }
				});

				$.reset(div_2);
				$.template_effect(() => $.set_text(text_1, `${$.get(stepValue) !== 1 ? `Step: ${$.get(stepValue)}` : ""} `));
				$.append($$anchor, fragment_2);
			},
			$$slots: { codeblock: true, default: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}