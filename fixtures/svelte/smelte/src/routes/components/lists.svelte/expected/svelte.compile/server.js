import * as $ from 'svelte/internal/server';
import Code from "docs/Code.svelte";
import List from "components/List";
import Icon from "components/Icon";
import Tabs, { Tab } from "components/Tabs";
import { darkMode } from "../../dark";
import lists from "examples/lists.txt";
import customLists from "examples/custom-lists.txt";
import PropsTable from "docs/PropsTable.svelte";

export default function Lists($$renderer) {
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

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Tabs($$renderer, {
			selected: '1',
			class: 'shadow mt-6 rounded-t-lg bg-dark-600',
			notSelectedColor: 'white',
			color: 'primary',
			items: [
				{ id: '1', text: 'List props', icon: 'list' },
				{ id: '2', text: 'List item props', icon: 'code' }
			],
			$$slots: {
				content: ($$renderer) => {
					$$renderer.push(`<div slot="content" class="flex items-center content-center overflow-hidden w-full bg-white h-full shadow-sm">`);

					Tab($$renderer, {
						id: '1',
						selected,
						children: ($$renderer) => {
							PropsTable($$renderer, {
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

					$$renderer.push(`<!----> `);

					Tab($$renderer, {
						id: '2',
						selected,
						children: ($$renderer) => {
							PropsTable($$renderer, {
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

					$$renderer.push(`<!----></div>`);
				}
			}
		});

		$$renderer.push(`<!----> <h6 class="mb-3 mt-6">One-line</h6> `);
		List($$renderer, { items: listOneLine });
		$$renderer.push(`<!----> <h6 class="mb-3 mt-6">Two-line</h6> `);
		List($$renderer, { items: listTwoLines });
		$$renderer.push(`<!----> <h6 class="mb-3 mt-6">Dense</h6> `);
		List($$renderer, { dense: true, items: listTwoLines });
		$$renderer.push(`<!----> `);
		Code($$renderer, { code: lists });
		$$renderer.push(`<!----> <h6 class="mb-3 mt-6">Custom list element using let:slots</h6> <small>I selected ${$.escape(selectedItem || "nothing")}.</small> `);

		List($$renderer, {
			items: menu,
			dense: true,
			navigation: true,
			get value() {
				return selectedItem;
			},

			set value($$value) {
				selectedItem = $$value;
				$$settled = false;
			},

			$$slots: {
				item: ($$renderer, { item }) => {
					$$renderer.push(`<li slot="item"><div${$.attr_class('cursor-pointer p-4 border-secondary-50 border my-2 border-solid duration-200 ease-in', void 0, { 'bg-secondary-50': selectedItem === item.text })}>${$.escape(selectedItem === item.text ? '👌' : '🙅‍')} ${$.escape(item.text)}</div></li>`);
				}
			}
		});

		$$renderer.push(`<!----> `);
		Code($$renderer, { code: customLists });
		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}