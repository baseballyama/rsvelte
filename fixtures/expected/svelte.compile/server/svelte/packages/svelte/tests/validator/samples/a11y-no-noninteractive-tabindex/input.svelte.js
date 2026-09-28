import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<button>click me</button> <button tabindex="0">click me</button> <button${$.attr('tabindex', 0)}>click me</button> <div></div> <div tabindex="-1"></div> <div role="button" tabindex="0"></div> <div role="article" tabindex="-1"></div> <article tabindex="-1"></article> <div role="tabpanel" tabindex="0"></div> `);

	$.element($$renderer, Math.random() ? 'button' : 'div', () => {
		$$renderer.push(` tabindex="0"`);
	});

	$$renderer.push(` <div tabindex="0"></div> <div role="article" tabindex="0"></div> <article tabindex="0"></article> <article${$.attr('tabindex', 0)}></article>`);
}