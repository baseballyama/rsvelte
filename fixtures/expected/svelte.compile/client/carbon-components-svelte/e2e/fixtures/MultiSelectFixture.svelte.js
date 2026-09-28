import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { MultiSelect } from "carbon-components-svelte";

var root = $.from_html(`<p data-testid="selected-count"> </p>`);
var root_1 = $.from_html(`<p data-testid="selected-roles-count"> </p>`);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function MultiSelectFixture($$anchor) {
	const items = [
		{ id: "apple", text: "Apple" },
		{ id: "banana", text: "Banana" },
		{ id: "cherry", text: "Cherry" },
		{ id: "date", text: "Date" },
		{ id: "elderberry", text: "Elderberry" }
	];

	const itemsWithSelectAll = [
		{ id: "select-all", text: "All roles", isSelectAll: true },
		{ id: "editor", text: "Editor" },
		{ id: "owner", text: "Owner" },
		{ id: "uploader", text: "Uploader" },
		{ id: "reader", text: "Reader", disabled: true }
	];

	let selectedIds = [];
	let selectedRoleIds = [];
	var fragment = root_2();
	var node = $.first_child(fragment);

	MultiSelect(node, {
		'data-testid': 'multiselect-fruits',
		labelText: 'Fruits',
		label: 'Choose fruits',
		get items() {
			return items;
		},
		filterable: true,
		placeholder: 'Filter fruits',
		get selectedIds() {
			return selectedIds;
		},

		set selectedIds($$value) {
			selectedIds = $$value;
		}
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var p = root();
			var text = $.only_child(p);

			$.template_effect(() => $.set_text(text, `Selected: ${selectedIds.length ?? ''}`));
			$.append($$anchor, p);
		};

		$.if(node_1, ($$render) => {
			if (selectedIds.length > 0) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	MultiSelect(node_2, {
		'data-testid': 'multiselect-roles',
		labelText: 'Roles',
		label: 'Choose roles',
		get items() {
			return itemsWithSelectAll;
		},
		filterable: true,
		placeholder: 'Filter roles...',
		get selectedIds() {
			return selectedRoleIds;
		},

		set selectedIds($$value) {
			selectedRoleIds = $$value;
		}
	});

	var node_3 = $.sibling(node_2, 2);

	{
		var consequent_1 = ($$anchor) => {
			var p_1 = root_1();
			var text_1 = $.only_child(p_1);

			$.template_effect(() => $.set_text(text_1, `Selected roles: ${selectedRoleIds.length ?? ''}`));
			$.append($$anchor, p_1);
		};

		$.if(node_3, ($$render) => {
			if (selectedRoleIds.length > 0) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
}