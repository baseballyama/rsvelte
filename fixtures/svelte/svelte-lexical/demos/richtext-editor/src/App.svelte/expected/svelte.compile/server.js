import * as $ from 'svelte/internal/server';
import { RichTextComposer } from 'svelte-lexical';
import { theme as editorTheme } from 'svelte-lexical/dist/themes/default';

export default function App($$renderer) {
	$$renderer.push(`<main><div class="header svelte-4ipybl"><img src="/images/logo.svg" alt="Svelte Lexical!" class="svelte-4ipybl"/> <p>This Rich Text Editor is build with <a href="https://github.com/umaranis/svelte-lexical/">svelte-lexical</a></p></div> `);
	RichTextComposer($$renderer, { theme: editorTheme });
	$$renderer.push(`<!----></main>`);
}