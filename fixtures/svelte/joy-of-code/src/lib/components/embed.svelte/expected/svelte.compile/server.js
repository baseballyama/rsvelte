import * as $ from 'svelte/internal/server';

export default function Embed($$renderer, $$props) {
	let { src, title } = $$props;
	let loaded = false;

	$$renderer.push(`<p class="embed example svelte-2a7m49">`);

	if (!loaded) {
		$$renderer.push(`<!--[0--><button class="svelte-2a7m49"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="var(--clr-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Load ${$.escape(title)}</button>`);
	} else {
		$$renderer.push(`<!--[-1--><iframe${$.attr('title', title)}${$.attr('src', src)} loading="lazy" allowfullscreen="" class="svelte-2a7m49"></iframe>`);
	}

	$$renderer.push(`<!--]--></p>`);
}