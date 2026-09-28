import * as $ from 'svelte/internal/server';
import Caret from '$lib/components/icons/Caret.svelte';

export default function Expandroute($$renderer, $$props) {
	let { subRoutes, title } = $$props;
	let expanded = false;

	$$renderer.push(`<button class="svelte-14kx1bs">`);

	Caret($$renderer, {
		style: `height: 1em; width: 1em; rotate: ${$.stringify(expanded ? 90 : 0)}deg; transition: all 200ms ease-in-out;`
	});

	$$renderer.push(`<!----> `);
	title($$renderer);
	$$renderer.push(`<!----></button> `);
	subRoutes($$renderer, expanded);
	$$renderer.push(`<!---->`);
}