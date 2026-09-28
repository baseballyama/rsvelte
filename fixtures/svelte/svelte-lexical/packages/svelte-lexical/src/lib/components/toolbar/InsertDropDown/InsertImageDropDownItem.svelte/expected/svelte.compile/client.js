import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DropDownItem from '../../generic/dropdown/DropDownItem.svelte';
import { getEditor } from '$lib/core/composerContext.js';

var root = $.from_html(`<i class="icon image"></i> <span class="text">Image</span>`, 1);

export default function InsertImageDropDownItem($$anchor, $$props) {
	$.push($$props, true);

	const editor = getEditor();

	DropDownItem($$anchor, {
		get onclick() {
			return editor.extensions.openInsertImageDialog;
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