import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import XIcon from '@lucide/svelte/icons/x';

var root = $.from_html(`<div class="card preset-filled-surface-100-900 w-full max-w-md p-4"><div class="flex justify-center items-center gap-2"><span class="text-sm opacity-60">To</span> <button class="chip preset-outlined-surface-400-600"><span>jane@email.com</span> <!></button> <button class="chip preset-outlined-surface-400-600"><span>dave@email.com</span> <!></button></div></div>`);

export default function Input($$anchor) {
	var div = root();
	var div_1 = $.child(div);
	var button = $.sibling($.child(div_1), 2);
	var node = $.sibling($.child(button), 2);

	XIcon(node, { size: 14 });
	$.reset(button);

	var button_1 = $.sibling(button, 2);
	var node_1 = $.sibling($.child(button_1), 2);

	XIcon(node_1, { size: 14 });
	$.reset(button_1);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}