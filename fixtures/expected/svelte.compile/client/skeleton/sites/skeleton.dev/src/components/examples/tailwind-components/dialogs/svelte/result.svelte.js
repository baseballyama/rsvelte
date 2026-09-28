import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<dialog class="dialog preset-filled-surface-100-900 animate-dialog"><header><h2 class="h3">Confirm action</h2></header> <article><p>Submitting either button closes the dialog and exposes its value via the dialog's returnValue.</p></article> <footer class="flex justify-end gap-2"><form method="dialog" class="flex gap-2"><button type="submit" value="cancel" class="btn preset-tonal">Cancel</button> <button type="submit" value="confirm" class="btn preset-filled">Confirm</button></form></footer></dialog> <div class="flex flex-col items-center gap-3"><button class="btn preset-filled">Open Dialog</button> <p class="text-sm opacity-75">Last result: <code> </code></p></div>`, 1);

export default function Result($$anchor) {
	let dialogRef;
	let result = $.state('—');

	function showModal() {
		dialogRef?.showModal();
	}

	function onClose() {
		$.set(result, dialogRef.returnValue || '(dismissed)', true);
	}

	var fragment = root();
	var dialog = $.first_child(fragment);

	$.bind_this(dialog, ($$value) => dialogRef = $$value, () => dialogRef);

	var div = $.sibling(dialog, 2);
	var button = $.child(div);
	var p = $.sibling(button, 2);
	var code = $.sibling($.child(p));
	var text = $.only_child(code, true);

	$.reset(p);
	$.reset(div);
	$.template_effect(() => $.set_text(text, $.get(result)));
	$.event('close', dialog, onClose);
	$.delegated('click', button, showModal);
	$.append($$anchor, fragment);
}

$.delegate(['click']);