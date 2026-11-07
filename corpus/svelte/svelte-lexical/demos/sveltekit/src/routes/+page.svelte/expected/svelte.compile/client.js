import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import RichTextComposer from './../RichTextComposer.svelte';
import '../global.css';

var root = $.from_html(`<main class="svelte-1crsdnr"><img src="images/logo.svg" alt="Svelte Lexical!" class="svelte-1crsdnr"/> <p>Welcome to <a href="https://github.com/umaranis/svelte-lexical/">svelte-lexical</a> demo built using <a href="https://kit.svelte.dev">SvelteKit</a></p> <div style="text-align: left;"><!></div></main>`);

export default function _page($$anchor) {
	var main = root();
	var div = $.sibling($.child(main), 4);
	var node = $.child(div);

	RichTextComposer(node, {});
	$.reset(div);
	$.reset(main);
	$.append($$anchor, main);
}