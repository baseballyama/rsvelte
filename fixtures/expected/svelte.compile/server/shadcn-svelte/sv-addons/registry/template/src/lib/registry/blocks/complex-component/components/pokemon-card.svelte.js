import * as $ from 'svelte/internal/server';
import { getPokemon } from "$lib/registry/blocks/complex-component/lib/pokemon.js";
import * as Card from "$lib/registry/ui/card/index.js";
import PokemonImage from "$lib/registry/blocks/complex-component/components/pokemon-image.svelte";

export default function Pokemon_card($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { name } = $$props;

		$.await(
			$$renderer,
			getPokemon(name),
			() => {
				$$renderer.push(`<div>Loading...</div>`);
			},
			(pokemon) => {
				if (pokemon) {
					$$renderer.push('<!--[0-->');

					if (Card.Root) {
						$$renderer.push('<!--[-->');

						Card.Root($$renderer, {
							children: ($$renderer) => {
								if (Card.Content) {
									$$renderer.push('<!--[-->');

									Card.Content($$renderer, {
										class: 'flex flex-col items-center p-2',
										children: ($$renderer) => {
											$$renderer.push(`<div>`);
											PokemonImage($$renderer, { name: pokemon.name, number: pokemon.id });
											$$renderer.push(`<!----></div> <div class="text-center font-medium">${$.escape(pokemon.name)}</div>`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}
		);

		$$renderer.push(`<!--]-->`);
	});
}