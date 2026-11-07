import * as $ from 'svelte/internal/server';
import PlainTextComposer from './PlainTextComposer.svelte';

export default function App($$renderer) {
	$$renderer.push(`<main class="svelte-zmsgzz"><img src="images/logo.svg" alt="Svelte Lexical!" class="svelte-zmsgzz"/> <p>This Plain Text Editor is build with <a href="https://github.com/umaranis/svelte-lexical/">svelte-lexical</a></p> `);
	PlainTextComposer($$renderer, {});
	$$renderer.push(`<!----></main>`);
}