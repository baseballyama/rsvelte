import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import RichTextComposer from './RichTextComposer.svelte';
import '../global.css';
import GitHubButton from './GitHubButton.svelte';
import PlaygroundButton from './PlaygroundButton.svelte';
import { ThemeSelector, ThemeImage } from '$lib/themes/system-light-dark/ui/index.js';

var root = $.from_html(`<main class="svelte-ocq595"><div class="header-container svelte-ocq595"><!></div> <!> <p style="margin-top: -1em; line-height: 1.7em">Welcome to <span class="emp-sl svelte-ocq595">Svelte-Lexical</span> , a rich text editor for <span class="emp-svelte svelte-ocq595">Svelte</span> and <span class="emp-svelte svelte-ocq595">SvelteKit</span> .</p> <div style="margin-top: 7em"><!> <!></div> <div style="text-align: left;"><!></div> <footer style="padding-top: 50px; color:gray; font-size:small">See more examples ( <a href="examples">evolution</a> / <a href="examples/html">html output</a> )</footer></main>`);

export default function _page($$anchor) {
	var main = root();
	var div = $.child(main);
	var node = $.child(div);

	ThemeSelector(node, {});
	$.reset(div);

	var node_1 = $.sibling(div, 2);

	ThemeImage(node_1, {
		lightSrc: 'images/logo.svg',
		darkSrc: 'images/logo_white.svg',
		alt: 'Svelte Lexical!',
		style: 'margin: 2em; max-width: 800px;'
	});

	var div_1 = $.sibling(node_1, 4);
	var node_2 = $.child(div_1);

	PlaygroundButton(node_2, {});

	var node_3 = $.sibling(node_2, 2);

	GitHubButton(node_3, {});
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_4 = $.child(div_2);

	RichTextComposer(node_4, {});
	$.reset(div_2);
	$.next(2);
	$.reset(main);
	$.append($$anchor, main);
}