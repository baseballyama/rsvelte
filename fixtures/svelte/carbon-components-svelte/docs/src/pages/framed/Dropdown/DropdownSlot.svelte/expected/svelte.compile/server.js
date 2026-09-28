import * as $ from 'svelte/internal/server';
import { Dropdown } from "carbon-components-svelte";

export default function DropdownSlot($$renderer) {
	Dropdown($$renderer, {
		labelText: 'Contact',
		selectedId: '0',
		items: [
			{ id: "0", text: "Slack" },
			{ id: "1", text: "Email" },
			{ id: "2", text: "Fax" }
		],
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { item, index, selected, highlighted }) => {
				$$renderer.push(`<div><strong>${$.escape(item.text)}</strong></div> <div>id: ${$.escape(item.id)} - index: ${$.escape(index)} - selected: ${$.escape(selected)} - highlighted:
    ${$.escape(highlighted)}</div>`);
			}
		}
	});
}