import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox, checkbox, Helper, Label, Radio, Button, uiHelpers } from "$lib";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

var root = $.from_html(`<div class="md:h-8"><!> <!></div> <div class="mt-4 mb-4 flex flex-wrap space-x-4"><!> <!></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start"><!> <!> <!> <!></div>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];

	// MetaTag
	let breadcrumb_title = "Checkbox builder";

	let description = "A quick way to create Checkbox component";
	let title = "Checkbox builder";
	let dir = "builder";
	const colors = Object.keys(checkbox.variants.color);
	let checkboxColor = $.state("primary");

	// const checkedStates = [ 'false', 'true', 'indeterminate' ];
	let checkedState = $.state(false);

	const changeCheckedState = () => {
		$.set(checkedState, !$.get(checkedState));
		$.set(indeterminateState, false);
	};

	let indeterminateState = $.state(false);

	const changeIntermidiateState = () => {
		$.set(indeterminateState, !$.get(indeterminateState));
		$.set(checkedState, false);
	};

	let disabledState = $.state(false);

	const changeDisabledState = () => {
		$.set(disabledState, !$.get(disabledState));
	};

	let helperState = $.state(false);

	const changeHelperState = () => {
		$.set(helperState, !$.get(helperState));
	};

	// code generator
	let generatedCode = $.derived(() => (() => {
		let props = [];

		if ($.get(checkedState)) props.push(" checked");
		if ($.get(indeterminateState)) props.push(" indeterminate");
		if ($.get(disabledState)) props.push(" disabled");

		const propsString = props.length > 0
			? props.map((prop) => `\n  ${prop}`).join("") + "\n"
			: "";

		return `<Checkbox${propsString}>My Checkbox</Checkbox>
${$.get(helperState) ? `<Helper class="ps-6">Helper text</Helper>` : ""}`;
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

			var text = $.text('Checkbox Builder');

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

				Checkbox(node_3, {
					get checked() {
						return $.get(checkedState);
					},

					get indeterminate() {
						return $.get(indeterminateState);
					},

					get color() {
						return $.get(checkboxColor);
					},

					get disabled() {
						return $.get(disabledState);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_3 = $.comment();
						var node_4 = $.first_child(fragment_3);

						{
							var consequent = ($$anchor) => {
								var text_1 = $.text('This is disabled');

								$.append($$anchor, text_1);
							};

							var alternate = ($$anchor) => {
								var text_2 = $.text('Default checkbox');

								$.append($$anchor, text_2);
							};

							$.if(node_4, ($$render) => {
								if ($.get(disabledState)) $$render(consequent); else $$render(alternate, -1);
							});
						}

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});

				var node_5 = $.sibling(node_3, 2);

				{
					var consequent_1 = ($$anchor) => {
						Helper($$anchor, {
							id: 'helper-checkbox-text',
							class: 'ps-6',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_3 = $.text('For orders shipped from $25 in books or $29 in other categories');

								$.append($$anchor, text_3);
							},
							$$slots: { default: true }
						});
					};

					$.if(node_5, ($$render) => {
						if ($.get(helperState)) $$render(consequent_1);
					});
				}

				$.reset(div);

				var div_1 = $.sibling(div, 2);
				var node_6 = $.child(div_1);

				Label(node_6, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text('Color');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});

				var node_7 = $.sibling(node_6, 2);

				$.each(node_7, 17, () => colors, $.index, ($$anchor, colorOption) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-24" },
						name: 'checkbox_color',
						get color() {
							return $.get(colorOption);
						},
						onchange: () => $.set(checkedState, true),
						get value() {
							return $.get(colorOption);
						},

						get group() {
							return $.get(checkboxColor);
						},

						set group($$value) {
							$.set(checkboxColor, $$value, true);
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

				$.reset(div_1);

				var div_2 = $.sibling(div_1, 2);
				var node_8 = $.child(div_2);

				Button(node_8, {
					class: 'w-48',
					color: 'primary',
					onclick: changeCheckedState,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_6 = $.text();

						$.template_effect(() => $.set_text(text_6, $.get(checkedState) ? "Remove checked" : "Add checked"));
						$.append($$anchor, text_6);
					},
					$$slots: { default: true }
				});

				var node_9 = $.sibling(node_8, 2);

				Button(node_9, {
					class: 'w-48',
					color: 'secondary',
					onclick: changeIntermidiateState,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_7 = $.text();

						$.template_effect(() => $.set_text(text_7, $.get(indeterminateState) ? "Remove indeterminate" : "Add indeterminate"));
						$.append($$anchor, text_7);
					},
					$$slots: { default: true }
				});

				var node_10 = $.sibling(node_9, 2);

				Button(node_10, {
					class: 'w-48',
					color: 'pink',
					onclick: changeDisabledState,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_8 = $.text();

						$.template_effect(() => $.set_text(text_8, $.get(disabledState) ? "Remove disabled" : "Add disabled"));
						$.append($$anchor, text_8);
					},
					$$slots: { default: true }
				});

				var node_11 = $.sibling(node_10, 2);

				Button(node_11, {
					class: 'w-48',
					color: 'lime',
					onclick: changeHelperState,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_9 = $.text();

						$.template_effect(() => $.set_text(text_9, $.get(helperState) ? "Remove helper" : "Add helper"));
						$.append($$anchor, text_9);
					},
					$$slots: { default: true }
				});

				$.reset(div_2);
				$.append($$anchor, fragment_2);
			},
			$$slots: { codeblock: true, default: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}