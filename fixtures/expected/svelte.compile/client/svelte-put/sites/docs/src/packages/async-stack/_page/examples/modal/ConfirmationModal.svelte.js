import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { enhancedialog } from './enhance-dialog';

var root = $.from_html(`<dialog class="bg-bg-200 text-fg backdrop:bg-bg space-y-4 p-8 shadow-lg backdrop:opacity-50 svelte-f6tcn3"><p class="text-xl font-medium"> </p> <p> </p> <form method="dialog" class="flex justify-end gap-4"><button type="submit" class="c-btn c-btn--outlined" value="no">No</button> <button type="submit" class="c-btn" value="yes">Yes</button></form></dialog>`);

export default function ConfirmationModal($$anchor, $$props) {
	$.push($$props, true);

	let dialog;

	function checkAndResolve() {
		// when dialog has closed and animation has finished, resolve
		if (!dialog.open) {
			$$props.item.resolve({ confirmed: dialog.returnValue === 'yes' });
		}
	}

	$.user_effect(() => {
		dialog?.showModal();
	});

	var dialog_1 = root();
	var p = $.child(dialog_1);
	var text = $.only_child(p, true);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1, true);

	$.next(2);
	$.reset(dialog_1);
	$.bind_this(dialog_1, ($$value) => dialog = $$value, () => dialog);
	$.action(dialog_1, ($$node) => enhancedialog?.($$node));

	$.template_effect(() => {
		$.set_text(text, $$props.title);
		$.set_text(text_1, $$props.description);
	});

	$.event('clickbackdrop', dialog_1, () => dialog.close());
	$.event('animationend', dialog_1, checkAndResolve);
	$.append($$anchor, dialog_1);
	$.pop();
}