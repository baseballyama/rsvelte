import * as $ from 'svelte/internal/server';
import Dropdown from "carbon-components-svelte/Dropdown/Dropdown.svelte";

export default function DropdownIconSlots_test($$renderer) {
	const items = [{ id: "0", text: "Slack" }, { id: "1", text: "Email" }];

	Dropdown($$renderer, {
		items,
		selectedId: '0',
		open: true,
		labelText: 'Icon slots',
		$$slots: {
			icon: ($$renderer, { item }) => {
				{
					$$renderer.push(`<span${$.attr('data-testid', `left-${$.stringify(item.id)}`)}>L</span>`);
				}
			},

			iconRight: ($$renderer, { item, selected }) => {
				{
					$$renderer.push(`<span${$.attr('data-testid', `right-${$.stringify(item.id)}`)}${$.attr('data-selected', selected)}>R</span>`);
				}
			}
		}
	});
}