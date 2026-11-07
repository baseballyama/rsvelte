import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<dialog role="alertdialog" aria-labelledby="alertdialog-title" aria-describedby="alertdialog-description" class="dialog animate-dialog preset-filled-error-500 [--dialog-backdrop:color-mix(in_oklab,var(--color-error-50-950)_75%,transparent)]"><header><h2 id="alertdialog-title" class="h3">Discard changes?</h2></header> <article><p id="alertdialog-description">You have unsaved changes that will be lost. This action cannot be undone.</p></article> <footer class="flex justify-end gap-2"><button type="button" class="btn preset-tonal">Cancel</button> <button type="button" class="btn preset-filled">Discard</button></footer></dialog> <button class="btn preset-filled">Open Dialog</button>`, 1);

export default function Alertdialog($$anchor) {
	let dialogRef;

	function showModal() {
		dialogRef?.showModal();
	}

	function closeModal() {
		dialogRef?.close();
	}

	var fragment = root();
	var dialog = $.first_child(fragment);
	var footer = $.sibling($.child(dialog), 4);
	var button = $.child(footer);
	var button_1 = $.sibling(button, 2);

	$.reset(footer);
	$.reset(dialog);
	$.bind_this(dialog, ($$value) => dialogRef = $$value, () => dialogRef);

	var button_2 = $.sibling(dialog, 2);

	$.delegated('click', button, closeModal);
	$.delegated('click', button_1, closeModal);
	$.delegated('click', button_2, showModal);
	$.append($$anchor, fragment);
}

$.delegate(['click']);