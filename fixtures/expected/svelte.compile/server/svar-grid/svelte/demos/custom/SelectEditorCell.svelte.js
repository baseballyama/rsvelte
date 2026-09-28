import * as $ from 'svelte/internal/server';
import EditorSelectCell from "./EditorSelectCell.svelte";

export default function SelectEditorCell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { row, column } = $$props;

		let data = $.derived(() => {
			const options = column.options;

			return options?.find((o) => o.id == row[column.id]);
		});

		EditorSelectCell($$renderer, { data: data() });
	});
}