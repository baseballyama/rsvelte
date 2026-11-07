import * as $ from 'svelte/internal/server';
import ComboBox from "carbon-components-svelte/ComboBox/ComboBox.svelte";

export default function ComboBoxGenerics_test($$renderer) {
	const items = [
		{ id: "1", text: "Laptop", price: 999, category: "Electronics" },
		{ id: "2", text: "Phone", price: 599, category: "Electronics" },
		{ id: "3", text: "Desk", price: 299, category: "Furniture" }
	];

	ComboBox($$renderer, {
		items,
		labelText: 'Products',
		placeholder: 'Select a product',
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