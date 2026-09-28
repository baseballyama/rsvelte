import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<dialog class="dialog preset-filled-surface-100-900 animate-dialog"><header><h2 class="h3">Hello world!</h2></header> <article><p>This is an example modal created using the native Dialog element.</p></article> <footer class="flex justify-end"><form method="dialog"><button type="button" class="btn preset-tonal">Close</button></form></footer></dialog> <button class="btn preset-filled">Open Dialog</button>`, 1);

export default function Default($$anchor) {
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
	var form = $.child(footer);
	var button = $.only_child(form);

	$.reset(footer);
	$.reset(dialog);
	$.bind_this(dialog, ($$value) => dialogRef = $$value, () => dialogRef);

	var button_1 = $.sibling(dialog, 2);

	$.delegated('click', button, closeModal);
	$.delegated('click', button_1, showModal);
	$.append($$anchor, fragment);
}

$.delegate(['click']);