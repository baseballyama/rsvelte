import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Table, table, uiHelpers, Label, Radio, Button } from "$lib";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

var root = $.from_html(`<!> <div class="my-4 flex flex-wrap space-x-4"><!> <!></div> <div class="mb-4 flex gap-4"><!> <!> <!> <!></div>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];

	// MetaTag
	let breadcrumb_title = "Table builder";

	let description = "A quick way to create Table component";
	let title = "Table builder";
	let dir = "builder";
	let color = $.state("default");
	const colors = Object.keys(table.variants.color);
	let striped = $.state(false);

	const changeStriped = () => {
		$.set(striped, !$.get(striped));
	};

	let hoverable = $.state(false);

	const changeHoverable = () => {
		$.set(hoverable, !$.get(hoverable));
	};

	// noborder, shadow,
	let noborder = $.state(false);

	const changeNoborder = () => {
		$.set(noborder, !$.get(noborder));
	};

	let shadow = $.state(false);

	const changeShadow = () => {
		$.set(shadow, !$.get(shadow));
	};

	const tableItems = [
		{
			name: 'Apple MacBook Pro 17"',
			color: "Silver",
			type: "Laptop",
			price: "$2999"
		},

		{
			name: "Microsoft Surface Pro",
			color: "White",
			type: "Laptop PC",
			price: "$1999"
		},

		{
			name: "Magic Mouse 2",
			color: "Black",
			type: "Accessories",
			price: "$99"
		},

		{
			name: "Google Pixel Phone",
			color: "Gray",
			type: "Phone",
			price: "$799"
		},

		{
			name: "Apple Watch 5",
			color: "Red",
			type: "Wearables",
			price: "$999"
		}
	];

	// code generator
	let generatedCode = $.derived(() => (() => {
		let props = [];

		if ($.get(color) !== "default") props.push(` color="${$.get(color)}"`);
		if ($.get(striped)) props.push(" striped");
		if ($.get(hoverable)) props.push(" hoverable");
		if (!$.get(noborder)) props.push(" noborder");
		if ($.get(shadow)) props.push(" shadow");

		const propsString = props.length > 0
			? props.map((prop) => `\n  ${prop}`).join("") + "\n"
			: "";

		return `<Table {tableItems}${propsString} />`;
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

			var text = $.text('Table Builder');

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

				Table(node_3, {
					get items() {
						return tableItems;
					},

					get hoverable() {
						return $.get(hoverable);
					},

					get color() {
						return $.get(color);
					},

					get striped() {
						return $.get(striped);
					},

					get border() {
						return $.get(noborder);
					},

					get shadow() {
						return $.get(shadow);
					}
				});

				var div = $.sibling(node_3, 2);
				var node_4 = $.child(div);

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

				$.each(node_5, 17, () => colors, $.index, ($$anchor, colorOption) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-24" },
						name: 'table_color',
						get color() {
							return $.get(colorOption);
						},

						get value() {
							return $.get(colorOption);
						},

						get group() {
							return $.get(color);
						},

						set group($$value) {
							$.set(color, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text();

							$.template_effect(() => $.set_text(text_2, $.get(colorOption)));
							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div);

				var div_1 = $.sibling(div, 2);
				var node_6 = $.child(div_1);

				Button(node_6, {
					class: 'w-40',
					onclick: changeStriped,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text();

						$.template_effect(() => $.set_text(text_3, $.get(striped) ? "Unstriped" : "Striped"));
						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});

				var node_7 = $.sibling(node_6, 2);

				Button(node_7, {
					class: 'w-40',
					color: 'secondary',
					onclick: changeHoverable,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text();

						$.template_effect(() => $.set_text(text_4, $.get(hoverable) ? "Unhoverable" : "Hoverable"));
						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});

				var node_8 = $.sibling(node_7, 2);

				Button(node_8, {
					class: 'w-40',
					color: 'indigo',
					onclick: changeNoborder,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text();

						$.template_effect(() => $.set_text(text_5, $.get(noborder) ? "Borderless" : "Border"));
						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});

				var node_9 = $.sibling(node_8, 2);

				Button(node_9, {
					class: 'w-40',
					color: 'rose',
					onclick: changeShadow,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_6 = $.text();

						$.template_effect(() => $.set_text(text_6, $.get(shadow) ? "No Shadow" : "Shadow"));
						$.append($$anchor, text_6);
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