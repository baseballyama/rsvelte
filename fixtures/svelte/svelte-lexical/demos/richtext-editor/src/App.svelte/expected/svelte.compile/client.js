import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RichTextComposer } from 'svelte-lexical';
import { theme as editorTheme } from 'svelte-lexical/dist/themes/default';

var root = $.from_html(`<main><div class="header svelte-4ipybl"><img src="/images/logo.svg" alt="Svelte Lexical!" class="svelte-4ipybl"/> <p>This Rich Text Editor is build with <a href="https://github.com/umaranis/svelte-lexical/">svelte-lexical</a></p></div> <!></main>`);

export default function App($$anchor) {
	var main = root();
	var node = $.sibling($.child(main), 2);

	RichTextComposer(node, {
		get theme() {
			return editorTheme;
		}
	});

	$.reset(main);
	$.append($$anchor, main);
}