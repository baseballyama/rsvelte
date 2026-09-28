import * as $ from 'svelte/internal/server';
import PokemonCard from "./components/pokemon-card.svelte";
import { getPokemonList } from "./lib/pokemon.js";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$.await(
			$$renderer,
			getPokemonList({ limit: 12 }),
			() => {
				$$renderer.push(`<div>Loading pokemons...</div>`);
			},
			(pokemons) => {
				if (pokemons) {
					$$renderer.push(`<!--[0--><div class="mx-auto w-full max-w-2xl px-4"><div class="grid grid-cols-2 gap-4 py-10 sm:grid-cols-3 md:grid-cols-4"><!--[-->`);

					const each_array = $.ensure_array_like(pokemons.results);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let pokemon = each_array[$$index];

						PokemonCard($$renderer, { name: pokemon.name });
					}

					$$renderer.push(`<!--]--></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}
		);

		$$renderer.push(`<!--]-->`);
	});
}