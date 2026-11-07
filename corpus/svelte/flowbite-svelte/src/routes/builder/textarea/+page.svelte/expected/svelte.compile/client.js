import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Label, uiHelpers, Textarea, Button, Helper } from "$lib";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

var root = $.from_html(`Your message <!>`, 1);
var root_1 = $.from_html(`<div class="mb-4 h-64"><!> <!></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start"><!> <!> <!> <!> <!> <!> <!></div>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	// MetaTag
	let breadcrumb_title = "Textarea builder";

	let description = "A quick way to create Textarea component";
	let title = "Textarea builder";
	let dir = "builder";

	// props
	let value = $.state("");

	const changeValue = () => {
		$.set(
			value,
			$.get(value) !== ""
				? ""
				: "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
			true
		);
	};

	let disabled = $.state(false);

	const changeDisabled = () => {
		$.set(disabled, !$.get(disabled));
	};

	let required = $.state(false);

	const changeRequired = () => {
		$.set(required, !$.get(required));
	};

	let placeholder = $.state("");

	const changePlaceholder = () => {
		$.set(placeholder, $.get(placeholder) !== "" ? "" : "Your message", true);

		$.set(
			value,
			$.get(placeholder) !== ""
				? ""
				: "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
			true
		);
	};

	let rows = $.state(void 0);

	const changeRows = () => {
		$.set(rows, $.get(rows) !== undefined ? undefined : 5, true);
	};

	let maxlength = $.state(void 0);

	const changeMaxlength = () => {
		$.set(maxlength, $.get(maxlength) !== undefined ? undefined : 20, true);

		$.set(
			value,
			$.get(maxlength) === 20
				? ""
				: "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
			true
		);
	};

	let textAreaClass = $.state("");

	const changeClass = () => {
		$.set(textAreaClass, $.get(textAreaClass) === "w-full" ? "w-48" : "w-full", true);
	};

	// code generator
	let generatedCode = $.derived(() => (() => {
		let props = [];

		if ($.get(required)) props.push(`required`);
		if ($.get(placeholder)) props.push(`placeholder="${$.get(placeholder)}"`);
		if ($.get(rows) !== undefined) props.push(`rows="${$.get(rows)}"`);
		if ($.get(maxlength)) props.push(`maxlength="${$.get(maxlength)}"`);
		if ($.get(textAreaClass)) props.push(`class="${$.get(textAreaClass)}"`);
		if ($.get(disabled)) props.push(`disabled`);
		if ($.get(value)) props.push(`value="${$.get(value)}"`);

		const propsString = props.length > 0
			? props.map((prop) => `\n  ${prop}`).join("") + "\n"
			: "";

		return `<Textarea${propsString} />`;
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

			var text = $.text('Textarea Builder');

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
					for: 'textarea-id',
					class: 'mb-2',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var fragment_3 = root();
						var node_4 = $.sibling($.first_child(fragment_3));

						{
							var consequent = ($$anchor) => {
								Helper($$anchor, {
									color: 'red',
									class: 'inline',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('* Required');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							};

							$.if(node_4, ($$render) => {
								if ($.get(required)) $$render(consequent);
							});
						}

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});

				var node_5 = $.sibling(node_3, 2);

				Textarea(node_5, {
					id: 'textarea-id',
					name: 'message',
					get value() {
						return $.get(value);
					},

					get required() {
						return $.get(required);
					},

					get rows() {
						return $.get(rows);
					},

					get maxlength() {
						return $.get(maxlength);
					},

					get placeholder() {
						return $.get(placeholder);
					},

					get class() {
						return $.get(textAreaClass);
					},

					get disabled() {
						return $.get(disabled);
					}
				});

				$.reset(div);

				var div_1 = $.sibling(div, 2);
				var node_6 = $.child(div_1);

				Button(node_6, {
					class: 'w-48',
					color: 'blue',
					onclick: changeRequired,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text();

						$.template_effect(() => $.set_text(text_2, $.get(required) ? "Remove required" : "Add required"));
						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});

				var node_7 = $.sibling(node_6, 2);

				Button(node_7, {
					class: 'w-48',
					color: 'red',
					onclick: changePlaceholder,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text();

						$.template_effect(() => $.set_text(text_3, $.get(placeholder) ? "Remove placeholder" : "Add placeholder"));
						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});

				var node_8 = $.sibling(node_7, 2);

				Button(node_8, {
					class: 'w-48',
					color: 'yellow',
					onclick: changeRows,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text();

						$.template_effect(() => $.set_text(text_4, $.get(rows) !== undefined ? "Remove rows" : "Add rows"));
						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});

				var node_9 = $.sibling(node_8, 2);

				Button(node_9, {
					class: 'w-48',
					color: 'green',
					onclick: changeMaxlength,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text();

						$.template_effect(() => $.set_text(text_5, $.get(maxlength) ? "Remove maxlength" : "Add maxlength"));
						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});

				var node_10 = $.sibling(node_9, 2);

				Button(node_10, {
					class: 'w-48',
					color: 'pink',
					onclick: changeClass,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_6 = $.text();

						$.template_effect(() => $.set_text(text_6, $.get(textAreaClass) === "w-full" ? "Use narrow width" : "Use full width"));
						$.append($$anchor, text_6);
					},
					$$slots: { default: true }
				});

				var node_11 = $.sibling(node_10, 2);

				Button(node_11, {
					class: 'w-48',
					color: 'purple',
					onclick: changeDisabled,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_7 = $.text();

						$.template_effect(() => $.set_text(text_7, $.get(disabled) ? "Remove disabled" : "Add disabled"));
						$.append($$anchor, text_7);
					},
					$$slots: { default: true }
				});

				var node_12 = $.sibling(node_11, 2);

				Button(node_12, {
					class: 'w-48',
					color: 'orange',
					onclick: changeValue,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_8 = $.text();

						$.template_effect(() => $.set_text(text_8, $.get(value) ? "Remove value" : "Add value"));
						$.append($$anchor, text_8);
					},
					$$slots: { default: true }
				});

				$.reset(div_1);
				$.append($$anchor, fragment_2);
			},
			$$slots: { codeblock: true, default: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}