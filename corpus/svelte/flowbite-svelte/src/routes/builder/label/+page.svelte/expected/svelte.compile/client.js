import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Label, label, Radio, uiHelpers } from "$lib";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { capitalizeFirstLetter } from "../utils/helpers";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

var root = $.from_html(`<!> <div class="flex flex-wrap space-x-2"><!> <!></div>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];

	// MetaTag
	let breadcrumb_title = "Label builder";

	let description = "A quick way to create Label component";
	let title = "Label builder";
	let dir = "builder";
	const colors = Object.keys(label.variants.color);
	let labelColor = $.state("gray");

	// code generator
	let generatedCode = $.derived(() => (() => {
		let props = [];

		if ($.get(labelColor) !== "gray") props.push(` color="${$.get(labelColor)}"`);

		const propsString = props.length > 0
			? props.map((prop) => `\n  ${prop}`).join("") + "\n"
			: "";

		return `<Label${propsString}>Label</Label>`;
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

			var text = $.text('Label Builder');

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
				var node_3 = $.first_child(fragment_2);

				Label(node_3, {
					class: 'text-lg font-bold',
					get color() {
						return $.get(labelColor);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text();

						$.template_effect(($0) => $.set_text(text_1, $0), [() => capitalizeFirstLetter($.get(labelColor))]);
						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				var div = $.sibling(node_3, 2);
				var node_4 = $.child(div);

				Label(node_4, {
					class: 'm-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('Color');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});

				var node_5 = $.sibling(node_4, 2);

				$.each(node_5, 17, () => colors, $.index, ($$anchor, colorOption) => {
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
							return $.get(labelColor);
						},

						set group($$value) {
							$.set(labelColor, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text();

							$.template_effect(() => $.set_text(text_3, $.get(colorOption)));
							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div);
				$.append($$anchor, fragment_2);
			},
			$$slots: { codeblock: true, default: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}