import * as $ from 'svelte/internal/server';
import MultiSelect from "carbon-components-svelte/MultiSelect/MultiSelect.svelte";

export default function MultiSelectGenerics_test($$renderer) {
	const items = [
		{ id: "1", text: "Laptop", price: 999, category: "Electronics" },
		{ id: "2", text: "Phone", price: 599, category: "Electronics" },
		{ id: "3", text: "Desk", price: 299, category: "Furniture" }
	];

	MultiSelect($$renderer, {
		items,
		label: 'Choose products',
		labelText: 'Products',
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { item }) => {
				const { id, text, price, category } = item;

				$$renderer.push(`<div><strong>${$.escape(text)}</strong> - $${$.escape(price)}
    - ${$.escape(id)} <span>(${$.escape(category)})</span></div>`);
			}
		}
	});
}