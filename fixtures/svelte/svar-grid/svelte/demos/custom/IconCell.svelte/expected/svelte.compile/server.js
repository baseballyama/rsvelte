import * as $ from 'svelte/internal/server';

export default function IconCell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { row, column, onaction } = $$props;

		function onClick() {
			onaction && onaction({
				action: "custom-icon",
				data: { column: column.id, row: row.id }
			});
		}

		$$renderer.push(`<div class="table_icon svelte-17ze49a"${$.attr('data-action-id', row.id)}><i class="wxi-dots-h"></i></div>`);
	});
}