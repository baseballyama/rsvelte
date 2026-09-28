import * as $ from 'svelte/internal/server';
import RichTextComposer from './../RichTextComposer.svelte';
import '../global.css';

export default function _page($$renderer) {
	$$renderer.push(`<main class="svelte-1crsdnr"><img src="images/logo.svg" alt="Svelte Lexical!" class="svelte-1crsdnr"/> <p>Welcome to <a href="https://github.com/umaranis/svelte-lexical/">svelte-lexical</a> demo built using <a href="https://kit.svelte.dev">SvelteKit</a></p> <div style="text-align: left;">`);
	RichTextComposer($$renderer, {});
	$$renderer.push(`<!----></div></main>`);
}