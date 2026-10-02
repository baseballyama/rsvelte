import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Spinner, spinner, Button, Label, Radio, uiHelpers } from "$lib";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

var root = $.from_html(`<div class="h-20"><div><!></div></div> <div class="mb-4 flex flex-wrap space-x-4"><!> <!></div> <div class="mb-4 flex flex-wrap space-x-4"><!> <!></div> <div class="mb-4 flex flex-wrap space-x-4"><!> <!></div> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	const binding_group_1 = [];
	const binding_group_2 = [];

	// MetaTag
	let breadcrumb_title = "Spinner builder";

	let description = "A quick way to create Spinner component";
	let title = "Spinner builder";
	let dir = "builder";

	// color, size, class
	const colors = Object.keys(spinner.variants.color);

	let spinnerColor = $.state("primary");
	const sizes = ["4", "5", "6", "8", "10", "12", "16"];
	let spinnerSize = $.state("8");
	let spinnerClass = $.state("");

	const changeClass = () => {
		$.set(spinnerClass, $.get(spinnerClass) === "" ? "ml-4" : "", true);
	};

	const alignments = [
		{ name: "left", class: "text-left" },
		{ name: "center", class: "text-center" },
		{ name: "right", class: "text-right" }
	];

	let selectedAlignment = $.state("left");
	let currentSpinner = $.derived(() => alignments.find((t) => t.name === $.get(selectedAlignment)) || alignments[0]);

	// code generator
	let generatedCode = $.derived(() => (() => {
		let props = [];

		if ($.get(spinnerSize) !== "8") props.push(` size="${$.get(spinnerSize)}"`);
		if ($.get(spinnerColor) !== "primary") props.push(` color="${$.get(spinnerColor)}"`);
		if ($.get(spinnerClass) !== "") props.push(` class="${$.get(spinnerClass)}"`);

		const propsString = props.length > 0
			? props.map((prop) => `\n  ${prop}`).join("") + "\n"
			: "";

		// alignment needs div wrapper
		if ($.get(selectedAlignment) !== "left") {
			return `<div class="${$.get(currentSpinner).class}">\n  <Spinner${propsString}/>\n</div>`;
		} else {
			return `<Spinner${propsString}/>`;
		}
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

			var text = $.text('Spinner Builder');

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
				var div_1 = $.child(div);
				var node_3 = $.child(div_1);

				Spinner(node_3, {
					get color() {
						return $.get(spinnerColor);
					},

					get size() {
						return $.get(spinnerSize);
					},

					get class() {
						return $.get(spinnerClass);
					}
				});

				$.reset(div_1);
				$.reset(div);

				var div_2 = $.sibling(div, 2);
				var node_4 = $.child(div_2);

				Label(node_4, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Color');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				var node_5 = $.sibling(node_4, 2);

				$.each(node_5, 17, () => colors, $.index, ($$anchor, color) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-24" },
						name: 'spinnercolor',
						get color() {
							return $.get(color);
						},

						get value() {
							return $.get(color);
						},

						get group() {
							return $.get(spinnerColor);
						},

						set group($$value) {
							$.set(spinnerColor, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text();

							$.template_effect(() => $.set_text(text_2, $.get(color)));
							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_2);

				var div_3 = $.sibling(div_2, 2);
				var node_6 = $.child(div_3);

				Label(node_6, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('Size');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});

				var node_7 = $.sibling(node_6, 2);

				$.each(node_7, 17, () => sizes, $.index, ($$anchor, size) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-12" },
						name: 'spinnersize',
						get value() {
							return $.get(size);
						},

						get group() {
							return $.get(spinnerSize);
						},

						set group($$value) {
							$.set(spinnerSize, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text();

							$.template_effect(() => $.set_text(text_4, $.get(size)));
							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_3);

				var div_4 = $.sibling(div_3, 2);
				var node_8 = $.child(div_4);

				Label(node_8, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text('Alignment');

						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});

				var node_9 = $.sibling(node_8, 2);

				$.each(node_9, 17, () => alignments, $.index, ($$anchor, option) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-16" },
						name: 'alignment',
						get value() {
							return $.get(option).name;
						},

						get group() {
							return $.get(selectedAlignment);
						},

						set group($$value) {
							$.set(selectedAlignment, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text();

							$.template_effect(() => $.set_text(text_6, $.get(option).name));
							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_4);

				var node_10 = $.sibling(div_4, 2);

				Button(node_10, {
					class: 'w-36',
					onclick: changeClass,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_7 = $.text();

						$.template_effect(() => $.set_text(text_7, $.get(spinnerClass) ? "Remove class" : "Add class"));
						$.append($$anchor, text_7);
					},
					$$slots: { default: true }
				});

				$.template_effect(() => $.set_class(div_1, 1, $.clsx($.get(currentSpinner).class)));
				$.append($$anchor, fragment_2);
			},
			$$slots: { codeblock: true, default: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}