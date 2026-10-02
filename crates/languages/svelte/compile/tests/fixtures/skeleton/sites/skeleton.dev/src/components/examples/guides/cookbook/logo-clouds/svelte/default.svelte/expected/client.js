import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<nav class="rounded-container grid w-full grid-cols-1 gap-1 overflow-hidden md:grid-cols-3"><a class="card preset-filled-surface-100-900 rounded-none p-4 py-8 text-center" href="#">Twitch</a> <a class="card preset-filled-surface-100-900 rounded-none p-4 py-8 text-center" href="#">YouTube</a> <a class="card preset-filled-surface-100-900 rounded-none p-4 py-8 text-center" href="#">TikTok</a></nav>`);

export default function Default($$anchor) {
	var nav = root();

	$.append($$anchor, nav);
}