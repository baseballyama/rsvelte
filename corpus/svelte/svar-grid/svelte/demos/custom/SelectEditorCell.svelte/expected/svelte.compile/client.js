import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import EditorSelectCell from "./EditorSelectCell.svelte";

export default function SelectEditorCell($$anchor, $$props) {
	$.push($$props, true);

	let data = $.derived(() => {
		const options = $$props.column.options;

		return options?.find((o) => o.id == $$props.row[$$props.column.id]);
	});

	EditorSelectCell($$anchor, {
		get data() {
			return $.get(data);
		}
	});

	$.pop();
}