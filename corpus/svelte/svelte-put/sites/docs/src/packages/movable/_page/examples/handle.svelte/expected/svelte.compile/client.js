import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { movable } from '@svelte-put/movable';

var root = $.from_html(`<div class="hl-info flex h-40 w-40 flex-col p-2"><div class="hl-warning grid h-8 w-8 place-items-center self-end">.</div> <div class="grid flex-1 place-items-center self-stretch">...</div></div>`);

export default function Handle($$anchor) {
	let handle = $.state(void 0);
	var div = root();
	var div_1 = $.child(div);

	$.bind_this(div_1, ($$value) => $.set(handle, $$value), () => $.get(handle));
	$.next(2);
	$.reset(div);
	$.action(div, ($$node, $$action_arg) => movable?.($$node, $$action_arg), () => ({ handle: $.get(handle) }));
	$.append($$anchor, div);
}