import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toggle, toggle, Radio, Label, Button, uiHelpers } from "$lib";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

var root = $.from_html(`<div>Off</div>`);
var root_1 = $.from_html(`<!> <!> Toggle`, 1);
var root_2 = $.from_html(`<div>On</div>`);
var root_3 = $.from_html(`<div class="h-12"><!></div> <div class="mb-4 flex flex-wrap"><!> <!></div> <div class="mb-4 flex flex-wrap space-x-4"><!> <!></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start"><!> <!> <!></div>`, 1);
var root_4 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	const binding_group_1 = [];

	// MetaTag
	let breadcrumb_title = "Toggle builder";

	let description = "A quick way to create Toggle component";
	let title = "Toggle builder";
	let dir = "builder";
	const colors = Object.keys(toggle.variants.color);
	let toggleColor = $.state("primary");
	const sizes = Object.keys(toggle.variants.size);
	let toggleSize = $.state("default");
	let checked = $.state(false);

	const changeChecked = () => {
		$.set(checked, !$.get(checked));
	};

	let disabled = $.state(false);

	const changeDisabled = () => {
		$.set(disabled, !$.get(disabled));
	};

	let leftSlot = $.state(false);

	const changeLeftLabel = () => {
		$.set(leftSlot, !$.get(leftSlot));
		$.set(checked, false);
	};

	// code generator
	let generatedCode = $.derived(() => (() => {
		let props = [];

		// let fileSlot = '';
		if ($.get(toggleSize) !== "default") props.push(` size="${$.get(toggleSize)}"`);

		if ($.get(toggleColor) !== "primary") props.push(` color="${$.get(toggleColor)}"`);
		if ($.get(checked)) props.push(" checked");
		if ($.get(disabled)) props.push(" disabled");
		if ($.get(leftSlot)) props.push(" bind:checked");

		const propsString = props.length > 0
			? props.map((prop) => `\n  ${prop}`).join("") + "\n"
			: "";

		return `<Toggle${propsString}>${$.get(leftSlot)
			? `\n {#snippet leftLabel()}\n  <div class="me-4 {!checked ? 'text-red-600 font-semibold' : ''}">Off</div>\n {/snippet}\n <div class={checked ? 'text-green-600 font-semibold' : ''}>On</div>\n`
			: "Toggle me"}</Toggle>`;
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

	var fragment = root_4();
	var node = $.first_child(fragment);

	MetaTag(node, { breadcrumb_title, description, title, dir });

	var node_1 = $.sibling(node, 2);

	H1(node_1, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Toggle Builder');

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
				var fragment_2 = root_3();
				var div = $.first_child(fragment_2);
				var node_3 = $.child(div);

				{
					const offLabel = ($$anchor) => {
						var fragment_3 = $.comment();
						var node_4 = $.first_child(fragment_3);

						{
							var consequent = ($$anchor) => {
								var div_1 = root();

								$.template_effect(() => $.set_class(div_1, 1, `me-4 ${!$.get(checked) ? 'font-semibold text-red-600' : ''}`));
								$.append($$anchor, div_1);
							};

							$.if(node_4, ($$render) => {
								if ($.get(leftSlot)) $$render(consequent);
							});
						}

						$.append($$anchor, fragment_3);
					};

					Toggle(node_3, {
						get color() {
							return $.get(toggleColor);
						},

						get size() {
							return $.get(toggleSize);
						},

						get disabled() {
							return $.get(disabled);
						},

						get checked() {
							return $.get(checked);
						},

						set checked($$value) {
							$.set(checked, $$value, true);
						},
						offLabel,
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_5 = $.first_child(fragment_4);

							{
								var consequent_3 = ($$anchor) => {
									var fragment_5 = root_1();
									var node_6 = $.first_child(fragment_5);

									{
										var consequent_1 = ($$anchor) => {
											var text_1 = $.text('Disabled');

											$.append($$anchor, text_1);
										};

										$.if(node_6, ($$render) => {
											if ($.get(disabled)) $$render(consequent_1);
										});
									}

									var node_7 = $.sibling(node_6, 2);

									{
										var consequent_2 = ($$anchor) => {
											var text_2 = $.text('Checked');

											$.append($$anchor, text_2);
										};

										$.if(node_7, ($$render) => {
											if ($.get(checked)) $$render(consequent_2);
										});
									}

									$.next();
									$.append($$anchor, fragment_5);
								};

								var alternate = ($$anchor) => {
									var div_2 = root_2();

									$.template_effect(() => $.set_class(div_2, 1, $.clsx($.get(checked) ? "font-semibold text-green-600" : "")));
									$.append($$anchor, div_2);
								};

								$.if(node_5, ($$render) => {
									if (!$.get(leftSlot)) $$render(consequent_3); else $$render(alternate, -1);
								});
							}

							$.append($$anchor, fragment_4);
						},
						$$slots: { offLabel: true, default: true }
					});
				}

				$.reset(div);

				var div_3 = $.sibling(div, 2);
				var node_8 = $.child(div_3);

				Label(node_8, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('Color');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});

				var node_9 = $.sibling(node_8, 2);

				$.each(node_9, 17, () => colors, $.index, ($$anchor, colorOption) => {
					Radio($$anchor, {
						class: 'm-2',
						classes: { label: "w-24" },
						name: 'toggle_color',
						get color() {
							return $.get(colorOption);
						},

						get value() {
							return $.get(colorOption);
						},

						get group() {
							return $.get(toggleColor);
						},

						set group($$value) {
							$.set(toggleColor, $$value, true);
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

				$.reset(div_3);

				var div_4 = $.sibling(div_3, 2);
				var node_10 = $.child(div_4);

				Label(node_10, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text('Size');

						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});

				var node_11 = $.sibling(node_10, 2);

				$.each(node_11, 17, () => sizes, $.index, ($$anchor, size) => {
					Radio($$anchor, {
						class: 'm-2',
						classes: { label: "w-32" },
						name: 'toggle_size',
						get value() {
							return $.get(size);
						},

						get group() {
							return $.get(toggleSize);
						},

						set group($$value) {
							$.set(toggleSize, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text();

							$.template_effect(() => $.set_text(text_6, $.get(size)));
							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_4);

				var div_5 = $.sibling(div_4, 2);
				var node_12 = $.child(div_5);

				Button(node_12, {
					class: 'w-40',
					onclick: changeChecked,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_7 = $.text();

						$.template_effect(() => $.set_text(text_7, $.get(checked) ? "Remove checked" : "Add checked"));
						$.append($$anchor, text_7);
					},
					$$slots: { default: true }
				});

				var node_13 = $.sibling(node_12, 2);

				Button(node_13, {
					class: 'w-40',
					color: 'secondary',
					onclick: changeDisabled,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_8 = $.text();

						$.template_effect(() => $.set_text(text_8, $.get(disabled) ? "Remove disabled" : "Add disabled"));
						$.append($$anchor, text_8);
					},
					$$slots: { default: true }
				});

				var node_14 = $.sibling(node_13, 2);

				Button(node_14, {
					class: 'w-40',
					color: 'emerald',
					onclick: changeLeftLabel,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_9 = $.text();

						$.template_effect(() => $.set_text(text_9, $.get(leftSlot) ? "Remove left slot" : "Add left slot"));
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