import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { movable } from '@svelte-put/movable';

var root = $.from_html(`<div class="grid place-items-center border-2 border-violet-500 p-4"><p class="text-center">Box below can be moved around, but only within the violet border</p> <div class="hl-info grid h-20 w-20 place-items-center">...</div></div>`);

export default function Limit_ancestor($$anchor) {
	let parentNode;
	var div = root();
	var div_1 = $.sibling($.child(div), 2);

	$.action(div_1, ($$node, $$action_arg) => movable?.($$node, $$action_arg), () => ({ limit: { parent: parentNode } }));
	$.reset(div);
	$.bind_this(div, ($$value) => parentNode = $$value, () => parentNode);
	$.append($$anchor, div);
}