import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PlainTextComposer from './PlainTextComposer.svelte';

var root = $.from_html(`<main class="svelte-zmsgzz"><img src="images/logo.svg" alt="Svelte Lexical!" class="svelte-zmsgzz"/> <p>This Plain Text Editor is build with <a href="https://github.com/umaranis/svelte-lexical/">svelte-lexical</a></p> <!></main>`);

export default function App($$anchor) {
	var main = root();
	var node = $.sibling($.child(main), 4);

	PlainTextComposer(node, {});
	$.reset(main);
	$.append($$anchor, main);
}