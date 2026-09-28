import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="relative"><dialog closedby="any" class="dialog preset-filled-surface-100-900 animate-dialog [--dialog-top:auto] [--dialog-left:50%] [--dialog-translate:-50%_0] bottom-full mb-2 whitespace-nowrap"><p>This acts as a tooltip.</p></dialog> <button class="btn preset-filled">Toggle Dialog</button></div>`);

export default function Nonmodal($$anchor) {
	let dialogRef;

	function toggle() {
		if (!dialogRef) return;

		if (dialogRef.open) {
			dialogRef.close();
		} else {
			dialogRef.show();
		}
	}

	var div = root();
	var dialog = $.child(div);

	$.bind_this(dialog, ($$value) => dialogRef = $$value, () => dialogRef);

	var button = $.sibling(dialog, 2);

	$.reset(div);
	$.delegated('click', button, toggle);
	$.append($$anchor, div);
}

$.delegate(['click']);