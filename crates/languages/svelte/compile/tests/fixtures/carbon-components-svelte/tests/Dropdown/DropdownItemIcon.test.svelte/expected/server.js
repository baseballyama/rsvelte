import * as $ from 'svelte/internal/server';
import Dropdown from "carbon-components-svelte/Dropdown/Dropdown.svelte";
import Edit from "carbon-icons-svelte/lib/Edit.svelte";

export default function DropdownItemIcon_test($$renderer) {
	const items = [
		{ id: "0", text: "With icon", icon: Edit },
		{ id: "1", text: "No icon" }
	];

	Dropdown($$renderer, {
		items,
		selectedId: '0',
		open: true,
		labelText: 'Item icons',
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { item, selected, highlighted }) => {
				$$renderer.push(`<span${$.attr('data-testid', `item-${$.stringify(item.id)}`)}${$.attr('data-selected', selected)}${$.attr('data-highlighted', highlighted)}>${$.escape(item.text)}</span>`);
			}
		}
	});
}