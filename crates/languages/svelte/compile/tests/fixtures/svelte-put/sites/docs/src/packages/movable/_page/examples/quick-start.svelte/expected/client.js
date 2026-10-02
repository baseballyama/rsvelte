import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { movable } from '@svelte-put/movable';

var root = $.from_html(`<div class="hl-info z-overlay grid h-20 w-20 place-items-center">...</div>`);

export default function Quick_start($$anchor) {
	var div = root();

	$.action(div, ($$node) => movable?.($$node));
	$.append($$anchor, div);
}