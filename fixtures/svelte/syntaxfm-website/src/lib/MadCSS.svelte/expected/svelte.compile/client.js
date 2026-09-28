import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="https://madcss.com" target="_blank" rel="noopener noreferrer" class="layout mad-css-banner svelte-3v9rhi"><div class="banner-content svelte-3v9rhi"><img src="/mad-css-logo2.svg" alt="MadCSS Logo" class="logo svelte-3v9rhi"/> <div class="text-section svelte-3v9rhi"><h1 class="headline svelte-3v9rhi">MadCSS is live!</h1> <h2 class="subtitle svelte-3v9rhi">16 Devs Battle for Glory</h2></div></div></a>`);

export default function MadCSS($$anchor) {
	var a = root();

	$.append($$anchor, a);
}