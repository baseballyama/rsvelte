import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Select, Label, Radio, Helper, uiHelpers, Button } from "$lib";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="h-32"><!> <!> <!></div> <div class="mb-4 flex flex-wrap space-x-2"><!> <!></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start"><!> <!> <!></div>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];

	// MetaTag
	let breadcrumb_title = "Select builder";

	let description = "A quick way to create Select component";
	let title = "Select builder";
	let dir = "builder";

	let countries = [
		{ value: "us", name: "United States", href: "/" },
		{ value: "ca", name: "Canada", href: "/" },
		{ value: "fr", name: "France", href: "/" }
	];

	const sizes = ["sm", "md", "lg"];
	let selectSize = $.state("md");
	const sizeDisplay = { sm: "Small", md: "Medium", lg: "Large" };
	let underline = $.state(false);

	const changeUnderline = () => {
		$.set(underline, !$.get(underline));
	};

	let disabled = $.state(false);

	const changeDiabled = () => {
		$.set(disabled, !$.get(disabled));
	};

	let selected = $.state("");
	let bindValue = $.state(false);

	const changeBindValue = () => {
		$.set(bindValue, !$.get(bindValue));
	};

	// code generator
	let generatedCode = $.derived(() => (() => {
		let props = [];

		// let fileSlot = '';
		if ($.get(selectSize) !== "md") props.push(` size="${$.get(selectSize)}"`);

		if ($.get(underline)) props.push(" underline");
		if ($.get(disabled)) props.push(" disabled");
		if ($.get(bindValue)) props.push(" bind:value={selected}");

		const propsString = props.length > 0
			? props.map((prop) => `\n  ${prop}`).join("") + "\n"
			: "";

		return `<Select${propsString} />${$.get(bindValue) ? "\nSelected value: {selected}" : ""}`;
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

			var text = $.text('Select Builder');

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

				Label(node_3, {
					for: 'select-sm',
					class: 'mb-4',
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root();
						var node_4 = $.first_child(fragment_3);

						{
							var consequent = ($$anchor) => {
								var text_1 = $.text('Disabled');

								$.append($$anchor, text_1);
							};

							$.if(node_4, ($$render) => {
								if ($.get(disabled)) $$render(consequent);
							});
						}

						var node_5 = $.sibling(node_4, 2);

						{
							var consequent_1 = ($$anchor) => {
								var text_2 = $.text();

								$.template_effect(() => $.set_text(text_2, `${sizeDisplay[$.get(selectSize)] ?? ''} select`));
								$.append($$anchor, text_2);
							};

							$.if(node_5, ($$render) => {
								if ($.get(selectSize)) $$render(consequent_1);
							});
						}

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});

				var node_6 = $.sibling(node_3, 2);

				Select(node_6, {
					id: 'select-sm',
					get size() {
						return $.get(selectSize);
					},

					get items() {
						return countries;
					},

					get underline() {
						return $.get(underline);
					},

					get disabled() {
						return $.get(disabled);
					},
					class: 'mb-2',
					get value() {
						return $.get(selected);
					},

					set value($$value) {
						$.set(selected, $$value, true);
					}
				});

				var node_7 = $.sibling(node_6, 2);

				{
					var consequent_2 = ($$anchor) => {
						Helper($$anchor, {
							class: 'text-base',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_3 = $.text();

								$.template_effect(() => $.set_text(text_3, `Selected value: ${$.get(selected) ?? ''}`));
								$.append($$anchor, text_3);
							},
							$$slots: { default: true }
						});
					};

					$.if(node_7, ($$render) => {
						if ($.get(bindValue)) $$render(consequent_2);
					});
				}

				$.reset(div);

				var div_1 = $.sibling(div, 2);
				var node_8 = $.child(div_1);

				Label(node_8, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text('Size');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});

				var node_9 = $.sibling(node_8, 2);

				$.each(node_9, 17, () => sizes, $.index, ($$anchor, option) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-24" },
						name: 'input_size',
						get value() {
							return $.get(option);
						},

						get group() {
							return $.get(selectSize);
						},

						set group($$value) {
							$.set(selectSize, $$value, true);
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

				$.reset(div_1);

				var div_2 = $.sibling(div_1, 2);
				var node_10 = $.child(div_2);

				Button(node_10, {
					class: 'w-40',
					onclick: changeUnderline,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_6 = $.text();

						$.template_effect(() => $.set_text(text_6, $.get(underline) ? "Default" : "Underline"));
						$.append($$anchor, text_6);
					},
					$$slots: { default: true }
				});

				var node_11 = $.sibling(node_10, 2);

				Button(node_11, {
					class: 'w-40',
					color: 'secondary',
					onclick: changeDiabled,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_7 = $.text();

						$.template_effect(() => $.set_text(text_7, $.get(disabled) ? "Enabled" : "Disabled"));
						$.append($$anchor, text_7);
					},
					$$slots: { default: true }
				});

				var node_12 = $.sibling(node_11, 2);

				Button(node_12, {
					class: 'w-40',
					color: 'rose',
					onclick: changeBindValue,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_8 = $.text();

						$.template_effect(() => $.set_text(text_8, $.get(bindValue) ? "Unbind" : "Bind value"));
						$.append($$anchor, text_8);
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