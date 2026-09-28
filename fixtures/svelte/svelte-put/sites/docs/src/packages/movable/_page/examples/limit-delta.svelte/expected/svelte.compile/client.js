import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { movable } from '@svelte-put/movable';

var root = $.from_html(`<div class="hl-info grid h-20 w-20 place-items-center">...</div>`);

export default function Limit_delta($$anchor) {
	var div = root();

	$.action(div, ($$node, $$action_arg) => movable?.($$node, $$action_arg), () => ({ limit: { delta: '100%' } }));
	$.append($$anchor, div);
}