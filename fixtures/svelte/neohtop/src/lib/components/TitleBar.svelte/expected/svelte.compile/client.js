import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="title-bar svelte-tq03kl" data-tauri-drag-region=""><div class="title svelte-tq03kl"><img src="/32x32.png" alt="NeoHtop" class="app-icon svelte-tq03kl"/> <div class="neon svelte-tq03kl">NeoHtop</div></div></div>`);

export default function TitleBar($$anchor) {
	var div = root();

	$.append($$anchor, div);
}