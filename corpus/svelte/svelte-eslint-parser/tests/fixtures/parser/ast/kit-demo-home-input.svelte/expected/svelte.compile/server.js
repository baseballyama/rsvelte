import * as $ from 'svelte/internal/server';
import Counter from '$lib/Counter/index.svelte';

export const prerender = true;

export default function Kit_demo_home_input($$renderer) {
	$.head('1kjg4f1', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Home</title>`);
		});
	});

	$$renderer.push(`<section class="svelte-1kjg4f1"><h1 class="svelte-1kjg4f1"><div class="welcome svelte-1kjg4f1"><picture><source srcset="svelte-welcome.webp" type="image/webp"/> <img src="svelte-welcome.png" alt="Welcome" class="svelte-1kjg4f1"/></picture></div> to your new<br/>SvelteKit app</h1> <h2>try editing <strong>src/routes/index.svelte</strong></h2> `);
	Counter($$renderer, {});
	$$renderer.push(`<!----></section>`);
}