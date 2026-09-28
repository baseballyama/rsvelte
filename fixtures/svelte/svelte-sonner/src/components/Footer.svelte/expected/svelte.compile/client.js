import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<footer class="wrapper svelte-1sr6y3t"><div class="container"><p class="p svelte-1sr6y3t"><img src="" alt="" class="svelte-1sr6y3t"/> <span>Ported by <a href="https://x.com/wobsoriano" target="_blank" class="svelte-1sr6y3t">wobsoriano.</a></span></p></div></footer>`);

export default function Footer($$anchor) {
	var footer = root();

	$.append($$anchor, footer);
}