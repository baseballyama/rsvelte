import * as $ from 'svelte/internal/server';
import Table from './Table.svelte';

function header($$renderer) {
	$$renderer.push(`<th>fruit</th> <th>qty</th> <th>price</th> <th>total</th>`);
}

function row($$renderer, d) {
	$$renderer.push(`<td>${$.escape(d.name)}</td> <td>${$.escape(d.qty)}</td> <td>${$.escape(d.price)}</td> <td>${$.escape(d.qty * d.price)}</td>`);
}

export default function _6_passing_snippets_to_components_input($$renderer) {
	const fruits = [
		{ name: 'apples', qty: 5, price: 2 },
		{ name: 'bananas', qty: 10, price: 1 },
		{ name: 'cherries', qty: 20, price: 0.5 }
	];

	Table($$renderer, { data: fruits, header, row });
}