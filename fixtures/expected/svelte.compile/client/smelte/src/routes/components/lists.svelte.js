import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Code from "docs/Code.svelte";
import List from "components/List";
import Icon from "components/Icon";
import Tabs, { Tab } from "components/Tabs";
import { darkMode } from "../../dark";
import lists from "examples/lists.txt";
import customLists from "examples/custom-lists.txt";
import PropsTable from "docs/PropsTable.svelte";

var root = $.from_html(`<div slot="content" class="flex items-center content-center overflow-hidden w-full bg-white h-full shadow-sm"><!> <!></div>`);
var root_1 = $.from_html(`<li slot="item"><div> </div></li>`);
var root_2 = $.from_html(`<!> <h6 class="mb-3 mt-6">One-line</h6> <!> <h6 class="mb-3 mt-6">Two-line</h6> <!> <h6 class="mb-3 mt-6">Dense</h6> <!> <!> <h6 class="mb-3 mt-6">Custom list element using let:slots</h6> <small> </small> <!> <!>`, 1);

export default function Lists($$anchor) {
	let selected;

	const listOneLine = [
		{ text: "Item 1", icon: "favorite" },
		{ text: "Item 2", icon: "favorite" },
		{ text: "Item 3", icon: "favorite" }
	];

	const listTwoLines = [
		{ text: "Item 1", icon: "favorite", subheading: "Subheading 1" },
		{ text: "Item 2", icon: "favorite", subheading: "Subheading 2" },
		{ text: "Item 3", icon: "favorite", subheading: "Subheading 3" }
	];

	let selectedItem = false;

	const menu = [
		{ to: "/components/text-fields", text: "Text fields" },
		{ to: "/components/buttons", text: "Buttons" },
		{
			to: "/components/selection-controls#checkboxes",
			text: "Checkboxes"
		},

		{
			to: "/components/selection-controls#radio-buttons",
			text: "Radio buttons"
		},

		{
			to: "/components/selection-controls#switches",
			text: "Switches"
		},
		{ to: "/components/lists", text: "Lists" }
	];

	var fragment = root_2();
	var node = $.first_child(fragment);

	Tabs(node, {
		selected: '1',
		class: 'shadow mt-6 rounded-t-lg bg-dark-600',
		notSelectedColor: 'white',
		color: 'primary',
		items: [
			{ id: '1', text: 'List props', icon: 'list' },
			{ id: '2', text: 'List item props', icon: 'code' }
		],
		$$slots: {
			content: ($$anchor, $$slotProps) => {
				var div = root();
				var node_1 = $.child(div);

				Tab(node_1, {
					id: '1',
					get selected() {
						return selected;
					},

					children: ($$anchor, $$slotProps) => {
						PropsTable($$anchor, {
							class: 'my-0 w-full',
							data: [
								{
									prop: "value",
									description: "Selected item value",
									type: "String",
									default: "empty string"
								},

								{
									prop: "items",
									description: "List items (item has id, value, to and text props)",
									type: "Array",
									default: "[]"
								},

								{
									prop: "dense",
									description: "Dense variant",
									type: "Boolean",
									default: "false"
								},

								{
									prop: "navigation",
									description: "Is navigation drawer list",
									default: "false",
									type: "Boolean"
								},

								{
									prop: "select",
									description: "Is dropdown selet",
									default: "false",
									type: "Boolean"
								}
							]
						});
					},
					$$slots: { default: true }
				});

				var node_2 = $.sibling(node_1, 2);

				Tab(node_2, {
					id: '2',
					get selected() {
						return selected;
					},

					children: ($$anchor, $$slotProps) => {
						PropsTable($$anchor, {
							class: 'my-0 w-full',
							data: [
								{
									prop: "icon",
									description: "Prepend item with icon",
									type: "String",
									default: "empty string"
								},

								{
									prop: "id",
									description: "Item id",
									type: "String",
									default: "empty string"
								},

								{
									prop: "value",
									description: "Selected item value",
									type: "String",
									default: "empty string"
								},

								{
									prop: "text",
									description: "Item text",
									type: "String",
									default: "empty string"
								},

								{
									prop: "subheading",
									description: "Item subheading",
									type: "String",
									default: "empty string"
								},

								{
									prop: "disabled",
									description: "Disabled state",
									type: "Boolean",
									default: false
								},

								{
									prop: "dense",
									description: "Dense variant",
									type: "Boolean",
									default: false
								},

								{
									prop: "navigation",
									description: "Is navigation item",
									type: "Boolean",
									default: false
								},

								{
									prop: "selected",
									description: "Is selected",
									type: "Boolean",
									default: false
								},

								{
									prop: "tabindex",
									description: "Tab index",
									type: "Number",
									default: null
								},

								{
									prop: "classes",
									description: "Item wrapper classes",
									type: "String",
									default: "hover:bg-gray-transDark relative overflow-hidden duration-200 ease-in p-4 cursor-pointer text-gray-700 flex items-center z-10"
								},

								{
									prop: "itemClasses",
									description: "Additional item classes",
									type: "String",
									default: "empty string"
								},

								{
									prop: "selectedClasses",
									description: "Selected item classes",
									type: "String",
									default: "bg-gray-200 hover:bg-primary-transDark"
								}
							]
						});
					},
					$$slots: { default: true }
				});

				$.reset(div);
				$.append($$anchor, div);
			}
		}
	});

	var node_3 = $.sibling(node, 4);

	List(node_3, {
		get items() {
			return listOneLine;
		}
	});

	var node_4 = $.sibling(node_3, 4);

	List(node_4, {
		get items() {
			return listTwoLines;
		}
	});

	var node_5 = $.sibling(node_4, 4);

	List(node_5, {
		dense: true,
		get items() {
			return listTwoLines;
		}
	});

	var node_6 = $.sibling(node_5, 2);

	Code(node_6, {
		get code() {
			return lists;
		}
	});

	var small = $.sibling(node_6, 4);
	var text = $.only_child(small);
	var node_7 = $.sibling(small, 2);

	List(node_7, {
		get items() {
			return menu;
		},
		dense: true,
		navigation: true,
		get value() {
			return selectedItem;
		},

		set value($$value) {
			selectedItem = $$value;
		},

		$$slots: {
			item: ($$anchor, $$slotProps) => {
				const item = $.derived(() => $$slotProps.item);
				var li = root_1();
				var div_1 = $.child(li);
				let classes;
				var text_1 = $.only_child(div_1);

				$.reset(li);

				$.template_effect(() => {
					classes = $.set_class(div_1, 1, 'cursor-pointer p-4 border-secondary-50 border my-2 border-solid duration-200 ease-in', null, classes, { 'bg-secondary-50': selectedItem === $.get(item).text });
					$.set_text(text_1, `${selectedItem === $.get(item).text ? '👌' : '🙅‍'} ${$.get(item).text ?? ''}`);
				});

				$.event('click', div_1, () => selectedItem = $.get(item).text);
				$.append($$anchor, li);
			}
		}
	});

	var node_8 = $.sibling(node_7, 2);

	Code(node_8, {
		get code() {
			return customLists;
		}
	});

	$.template_effect(() => $.set_text(text, `I selected ${(selectedItem || "nothing") ?? ''}.`));
	$.append($$anchor, fragment);
}