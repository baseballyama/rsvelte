import * as $ from 'svelte/internal/server';
import { getAbortSignal } from 'svelte';

export default function Pokemon_search($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let pokemon = 'charizard';
		let image = '';

		async function getPokemon(pokemon) {
			const baseUrl = 'https://pokeapi.co/api/v2/pokemon';
			const response = await fetch(`${baseUrl}/${pokemon}`, { signal: getAbortSignal() });

			if (!response.ok) throw new Error('💣️ oops!');

			return response.json();
		}

		$$renderer.push(`<div class="container"><div><input type="search" placeholder="Enter Pokemon name" class="svelte-m5x4cx"/> <img${$.attr('src', image)}${$.attr('alt', pokemon)} class="svelte-m5x4cx"/></div></div>`);
	});
}