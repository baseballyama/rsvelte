import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="card preset-filled-surface-100-900 w-full max-w-md p-4"><div class="flex justify-center items-center gap-2"><span class="text-sm opacity-60">Rating</span> <button class="chip preset-outlined-surface-400-600"><span>Bad</span></button> <button class="chip preset-outlined-surface-400-600"><span>Good</span></button> <button class="chip preset-outlined-surface-400-600"><span>Awesome</span></button></div></div>`);

export default function Suggestion($$anchor) {
	var div = root();

	$.append($$anchor, div);
}