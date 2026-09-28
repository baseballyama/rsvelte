import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AlarmClockIcon from '@lucide/svelte/icons/alarm-clock';
import AppWindowIcon from '@lucide/svelte/icons/app-window';
import SunIcon from '@lucide/svelte/icons/sun';

var root = $.from_html(`<div class="card preset-filled-surface-100-900 p-4 space-y-4 w-full max-w-md overflow-hidden"><header><h2 class="h6">Home Automation</h2></header> <article class="space-y-4"><p class="opacity-60">Control your smart home with a single tap. Choose one of the quick actions below to get started.</p></article> <hr class="hr"/> <footer class="flex items-center justify-start gap-2 overflow-x-auto [scrollbar-width:none]"><button type="button" class="chip preset-outlined-surface-400-600"><!> <span>Turn on lights</span></button> <button type="button" class="chip preset-outlined-surface-400-600"><!> <span>Set alarm</span></button> <button type="button" class="chip preset-outlined-surface-400-600"><!> <span>Close blinds</span></button></footer></div>`);

export default function Assist($$anchor) {
	var div = root();
	var footer = $.sibling($.child(div), 6);
	var button = $.child(footer);
	var node = $.child(button);

	SunIcon(node, { size: 14 });
	$.next(2);
	$.reset(button);

	var button_1 = $.sibling(button, 2);
	var node_1 = $.child(button_1);

	AlarmClockIcon(node_1, { size: 14 });
	$.next(2);
	$.reset(button_1);

	var button_2 = $.sibling(button_1, 2);
	var node_2 = $.child(button_2);

	AppWindowIcon(node_2, { size: 14 });
	$.next(2);
	$.reset(button_2);
	$.reset(footer);
	$.reset(div);
	$.append($$anchor, div);
}