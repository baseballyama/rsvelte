import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Counter from '$lib/Counter/index.svelte';

export const prerender = true;

var root = $.from_html(`<section class="svelte-1kjg4f1"><h1 class="svelte-1kjg4f1"><div class="welcome svelte-1kjg4f1"><picture><source srcset="svelte-welcome.webp" type="image/webp"/> <img src="svelte-welcome.png" alt="Welcome" class="svelte-1kjg4f1"/></picture></div> to your new<br/>SvelteKit app</h1> <h2>try editing <strong>src/routes/index.svelte</strong></h2> <!></section>`);

export default function Kit_demo_home_input($$anchor) {
	var section = root();

	$.head('1kjg4f1', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Home';
		});
	});

	var node = $.sibling($.child(section), 4);

	Counter(node, {});
	$.reset(section);
	$.append($$anchor, section);
}