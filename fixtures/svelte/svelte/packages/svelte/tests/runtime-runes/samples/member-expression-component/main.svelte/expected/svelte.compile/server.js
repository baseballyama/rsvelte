import * as $ from 'svelte/internal/server';
import Row from './Row.svelte';

export default function Main($$renderer) {
	const items = [{ id: 0 }, { id: 1 }, { id: 2 }];
	const Table = { Row };

	$$renderer.push(`<button>flip</button> <!--[-->`);

	const each_array = $.ensure_array_like(items);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];

		if (Table.Row) {
			$$renderer.push('<!--[-->');
			Table.Row($$renderer, { id: item.id });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	}

	$$renderer.push(`<!--]-->`);
}