import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="w-full grid grid-cols-[auto_1fr_auto] gap-1"><div class="bg-surface-100-900 p-4">(nav)</div> <div class="bg-surface-100-900 p-4">(feed)</div> <div class="bg-surface-100-900 p-4">(online)</div></div>`);

export default function Columns($$anchor) {
	var div = root();

	$.append($$anchor, div);
}