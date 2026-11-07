import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Heading, Button, Label, Radio, Input, CloseButton, uiHelpers } from "$lib";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

var root = $.from_html(`<!> <!> <div class="h-24"><!></div> <div class="mb-4 flex flex-wrap space-x-2"><!> <!></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start"><!></div>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];

	// MetaTag
	let breadcrumb_title = "Heading builder";

	let description = "A quick way to create Heading component";
	let title = "Heading builder";
	let dir = "builder";
	const tags = ["h1", "h2", "h3", "h4", "h5", "h6"];
	let headingTag = $.state("h1");
	let headingCls = $.state("text-primary-700 dark:text-primary-500");

	const changeHeadingCls = () => {
		$.set(
			headingCls,
			$.get(headingCls) === "text-primary-700 dark:text-primary-500"
				? "text-blue-500 dark:text-blue-400 uppercase italic underline text-center font-semibold bg-gray-50 dark:bg-gray-700 p-4"
				: "text-primary-700 dark:text-primary-500",
			true
		);
	};

	let text = $.prop($$props, 'text', 15, "My heading");

	// code generator
	let generatedCode = $.derived(() => (() => {
		let props = [];

		if ($.get(headingTag)) props.push(` tag="${$.get(headingTag)}"`);
		if ($.get(headingCls)) props.push(` class="${$.get(headingCls)}"`);

		const propsString = props.length > 0
			? props.map((prop) => `\n  ${prop}`).join("") + "\n"
			: "";

		return `<Heading${propsString}>
  ${text()}
</Headin>`;
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

			var text_1 = $.text('Heading Builder');

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
				var fragment_2 = root();
				var node_3 = $.first_child(fragment_2);

				Label(node_3, {
					class: 'text-md mb-2',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('Edit heading');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});

				var node_4 = $.sibling(node_3, 2);

				{
					const right = ($$anchor) => {
						CloseButton($$anchor, { onclick: () => text("") });
					};

					Input(node_4, {
						type: 'text',
						placeholder: 'Write your blockquote text',
						class: 'mb-8 pr-12',
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

				var div = $.sibling(node_4, 2);
				var node_5 = $.child(div);

				Heading(node_5, {
					get tag() {
						return $.get(headingTag);
					},

					get class() {
						return $.get(headingCls);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text();

						$.template_effect(() => $.set_text(text_3, text()));
						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});

				$.reset(div);

				var div_1 = $.sibling(div, 2);
				var node_6 = $.child(div_1);

				Label(node_6, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text('Rounded');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});

				var node_7 = $.sibling(node_6, 2);

				$.each(node_7, 17, () => tags, $.index, ($$anchor, tag) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-12" },
						name: 'tag',
						get value() {
							return $.get(tag);
						},

						get group() {
							return $.get(headingTag);
						},

						set group($$value) {
							$.set(headingTag, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text();

							$.template_effect(() => $.set_text(text_5, $.get(tag)));
							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_1);

				var div_2 = $.sibling(div_1, 2);
				var node_8 = $.child(div_2);

				Button(node_8, {
					class: 'w-40',
					color: 'blue',
					onclick: changeHeadingCls,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_6 = $.text();

						$.template_effect(() => $.set_text(text_6, $.get(headingCls) !== "text-primary-700 dark:text-primary-500" ? "Original class" : "Change class"));
						$.append($$anchor, text_6);
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