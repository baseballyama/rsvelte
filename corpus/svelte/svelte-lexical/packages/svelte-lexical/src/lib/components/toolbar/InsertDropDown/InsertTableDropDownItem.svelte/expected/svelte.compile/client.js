import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getEditor } from '$lib/core/composerContext.js';
import DropDownItem from '../../generic/dropdown/DropDownItem.svelte';

var root = $.from_html(`<i class="icon table"></i> <span class="text">Table</span>`, 1);

export default function InsertTableDropDownItem($$anchor, $$props) {
	$.push($$props, true);

	const editor = getEditor();

	DropDownItem($$anchor, {
		get onclick() {
			return editor.extensions.openInsertTableDialog;
		},
		class: 'item',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}