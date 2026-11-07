import * as $ from 'svelte/internal/server';

export default function _7_passing_snippets_to_components_input($$renderer) {
	{
		function header($$renderer) {
			$$renderer.push(`<th>fruit</th> <th>qty</th> <th>price</th> <th>total</th>`);
		}

		function row($$renderer, d) {
			$$renderer.push(`<td>${$.escape(d.name)}</td> <td>${$.escape(d.qty)}</td> <td>${$.escape(d.price)}</td> <td>${$.escape(d.qty * d.price)}</td>`);
		}

		Table($$renderer, {
			data: fruits,
			header,
			row,
			$$slots: { header: true, row: true }
		});
	}
}