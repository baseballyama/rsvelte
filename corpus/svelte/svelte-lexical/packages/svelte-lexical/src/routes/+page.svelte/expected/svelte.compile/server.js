import * as $ from 'svelte/internal/server';
import RichTextComposer from './RichTextComposer.svelte';
import '../global.css';
import GitHubButton from './GitHubButton.svelte';
import PlaygroundButton from './PlaygroundButton.svelte';
import { ThemeSelector, ThemeImage } from '$lib/themes/system-light-dark/ui/index.js';

export default function _page($$renderer) {
	$$renderer.push(`<main class="svelte-ocq595"><div class="header-container svelte-ocq595">`);
	ThemeSelector($$renderer, {});
	$$renderer.push(`<!----></div> `);

	ThemeImage($$renderer, {
		lightSrc: 'images/logo.svg',
		darkSrc: 'images/logo_white.svg',
		alt: 'Svelte Lexical!',
		style: 'margin: 2em; max-width: 800px;'
	});

	$$renderer.push(`<!----> <p style="margin-top: -1em; line-height: 1.7em">Welcome to <span class="emp-sl svelte-ocq595">Svelte-Lexical</span> , a rich text editor for <span class="emp-svelte svelte-ocq595">Svelte</span> and <span class="emp-svelte svelte-ocq595">SvelteKit</span> .</p> <div style="margin-top: 7em">`);
	PlaygroundButton($$renderer, {});
	$$renderer.push(`<!----> `);
	GitHubButton($$renderer, {});
	$$renderer.push(`<!----></div> <div style="text-align: left;">`);
	RichTextComposer($$renderer, {});
	$$renderer.push(`<!----></div> <footer style="padding-top: 50px; color:gray; font-size:small">See more examples ( <a href="examples">evolution</a> / <a href="examples/html">html output</a> )</footer></main>`);
}